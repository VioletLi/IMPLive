module Neweval exposing (..)

import Syntax exposing (..)
import Newlangutils exposing (..)
import Round

type alias EvalRes = 
    { value : Value
    , senv : SEnv
    , count : List (HoleName, Int)
    , stdin : Stdin
    , stdout : Stdout
    }

defaultEvalRes : EvalRes
defaultEvalRes =
    { value = M (VError "Default Evaluation Result")
    , senv = []
    , count = []
    , stdin = ([], Normal)
    , stdout = ([], Normal)
    }

type alias FuncSummary = List (String, (List String, Bool, Bool))


eval : Context -> Expr -> List (HoleName, Int) -> FuncSummary -> EvalRes
eval context expr count funcSummary =
    case expr of
        EParens _ e ->
            eval context e count funcSummary
        EVar _ x ->
            case findVarByName x context.venv of
                Just (Loc l) -> 
                    let val = findValByLoc l context.senv in
                    case val of
                        VError info -> { defaultEvalRes | value = M (VError info) }
                        _ -> { value = M val, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Just v -> 
                    case v of
                        VFix e -> eval context (EFix defaultWS e) count funcSummary
                        _ -> { value = IM v, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Nothing ->
                    { defaultEvalRes | value = M (VError "Variable not found") }
        ELam _ p e ->
            { value = IM (VClosure p e context.venv), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ELet _ p e1 e2 ->
            let res = eval context e1 count funcSummary in
            case (p, res.value, e1) of
                (PVar _ s, IM val, ELam ws1 p1 e1_) ->
                    -- only vfix or vclosure, stored in venv as immutable value
                    let (vs, r, w) = analyzeEffect funcSummary e1_ in
                    let factvs = unique (findCurVars vs context.venv) in
                    eval { venv = (s, val) :: context.venv, senv = res.senv, stdin = res.stdin, stdout = res.stdout, henv = context.henv} e2 res.count ((s, (factvs, r, w))::funcSummary)
                (_, IM _, _) -> 
                    { defaultEvalRes | value = M (VError "Pattern of function is not a variable") }
                (_, M (VError info), _) -> { defaultEvalRes | value = M (VError ("eval let:"++info)) }
                (_, M val, _) ->
                    let matchResult = match p val in
                    case matchResult of
                        [(_, VError info)] -> { defaultEvalRes | value = M (VError ("pattern matching in let:"++info)) }
                        _ -> 
                            let (venv_, senv_) = applyMatchResult matchResult context.venv context.senv in
                            eval { venv = venv_, senv = senv_, henv = context.henv, stdin = res.stdin, stdout = res.stdout} e2 res.count funcSummary
        ELetrec _ (PVar ws x) (ELam ws1 p e1) e2 ->
            let (vs, r, w) = analyzeEffect ((x, ([], False, False))::funcSummary) e1 in
            let factvs = unique (findCurVars vs context.venv) in
            eval context (EApp defaultWS (ELam defaultWS (PVar ws x) e2) (EFix defaultWS (ELam defaultWS (PVar ws x) (ELam ws1 p e1)))) count ((x, (factvs, r, w))::funcSummary)
            -- case p of
            --     PVar _ x ->
            --         let venv_ = (x, length context.senv) :: context.venv in
            --         let res = eval {context | venv = venv_ } e1 count in
            --         case res.value of
            --             VClosure _ _ _ -> 
            --                 eval { venv = venv_, senv = context.senv ++ [res.value], henv = context.henv, stdin = res.stdin, stdout = res.stdout} e2 res.count
            --             _ -> { defaultEvalRes | value = VError "Recursive binding is only allowed for single variable" }
            --     _ -> { defaultEvalRes | value = VError "Recursive binding is only allowed for single variable" }
        ELetrec _ _ _ _ -> { defaultEvalRes | value = M (VError "Recursive binding is only allowed for single variable") }
        EApp _ e1 e2 ->
            let res1 = eval context e1 count funcSummary in
            case res1.value of
                IM (VClosure p e venvf) ->
                    case e2 of
                        EFix _ e_ -> 
                            case p of
                                PVar _ x ->
                                    eval { context | venv = (x, VFix e_) :: context.venv, senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout } e res1.count funcSummary
                                _ -> { defaultEvalRes | value = M (VError "Recursive binding is only allowed for single variable") }
                        _ ->
                            let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count funcSummary in
                            case res2.value of
                                M (VError info) -> { defaultEvalRes | value = M (VError ("function application:"++info)) }
                                M val ->
                                    let matchResult = match p val in
                                    case matchResult of
                                        [(_, VError info)] -> { defaultEvalRes | value = M (VError ("pattern matching in function application:"++info)) }
                                        _ -> 
                                            let (venv_, senv_) = applyArgs matchResult (length res2.senv) in
                                            let resf = eval { venv = venv_ ++ venvf, senv = res2.senv ++ senv_, henv = context.henv, stdin = res2.stdin, stdout = res2.stdout} e res2.count funcSummary in
                                            { resf | senv = List.take (List.length context.senv) resf.senv }
                                _ -> { defaultEvalRes | value = M (VError "Function application error: vclosure or vfix as argument") }
                _ -> { defaultEvalRes | value = M (VError "Function application error") }
        EInt _ n ->
            { value = M (VInt n), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EFloat _ f ->
            { value = M (VFloat f), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ETrue _ ->
            { value = M VTrue, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EFalse _ ->
            { value = M VFalse, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EChar _ c ->
            { value = M (VChar c), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ECons (_, id) e1 e2 ->
            let
                res1 = eval context e1 count funcSummary in
            case res1.value of
                M (VError info) -> { defaultEvalRes | value = M (VError ("eval cons head:"++info)) }
                M val1 ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count funcSummary
                    in
                    case res2.value of
                        M (VError info) -> { defaultEvalRes | value = M (VError ("eval cons tail:"++info)) }
                        M (VHole _ _) -> 
                            let 
                                c = 
                                    findCount tempHoleCount count 
                            in
                                { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::count, stdin = res2.stdin, stdout = res2.stdout }
                        M val2 ->
                            if id == esQuo || id == esElm then
                                { value = M (VCons vsId val1 val2), senv = res2.senv, count = count, stdin = res2.stdin, stdout = res2.stdout }
                            else
                                { value = M (VCons voId val1 val2), senv = res2.senv, count = count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Function application error: vclosure or vfix in list") }
                _ -> { defaultEvalRes | value = M (VError "Function application error: vclosure or vfix in list") }
        ENil (_, id) ->
            if id == 3 || id == 4 then
                { value = M (VNil 1), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
            else
                { value = M (VNil 0), senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EHole _ hn ->
            let v = findValue hn context.venv context.senv context.henv in
            case v of
                Just v_ -> { value = M v_, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Nothing ->
                    let c = findCount hn count in
                    { value = M (VHole (HInst hn (c+1)) (context.venv, context.senv)), senv = context.senv, count = (hn, c+1)::count, stdin = context.stdin, stdout = context.stdout }
        EBPrim _ bop e1 e2 ->
            let res1 = eval context e1 count funcSummary in
            let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count funcSummary in
            case res1.value of
                M (VInt n1) ->
                    case res2.value of
                        M (VInt n2) ->
                            case bop of
                                Add -> { value = M (VInt (n1 + n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Sub -> { value = M (VInt (n1 - n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Mul -> { value = M (VInt (n1 * n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Div -> { value = M (VInt (n1 // n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                DDiv -> { value = M (VFloat (Round.roundNumCom 2 <| ((toFloat n1) / (toFloat n2)))), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Eq -> { value = M (boolOp (n1 == n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Lt -> { value = M (boolOp (n1 < n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Gt -> { value = M (boolOp (n1 > n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Le -> { value = M (boolOp (n1 <= n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Ge -> { value = M (boolOp (n1 >= n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 01") }
                        M (VFloat n2) -> { value = M (floatOp bop (toFloat n1) n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 01") }
                M (VFloat n1) ->
                    case res2.value of
                        M (VInt n2) -> { value = M (floatOp bop n1 (toFloat n2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        M (VFloat n2) -> { value = M (floatOp bop n1 n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 02") }
                M VTrue ->
                    case res2.value of
                        M VTrue -> 
                            case bop of
                                And -> { value = M VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = M VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 02") }
                        M VFalse ->
                            case bop of
                                And -> { value = M VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = M VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 03") }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 03") }
                M VFalse ->
                    case res2.value of
                        M VTrue ->
                            case bop of
                                And -> { value = M VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = M VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 04") }
                        M VFalse ->
                            case bop of
                                And -> { value = M VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = M VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 05") }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 04") }
                M (VCons id val1 val2) ->
                    case res2.value of
                        M (VCons id_ val1_ val2_) ->
                            case bop of
                                Cat -> { value = M (append (VCons id val1 val2) (VCons id_ val1_ val2_)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 06") }
                        M (VNil id_) ->
                            { value = M (append (VCons id val1 val2) (VNil id_)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 05") }
                M (VNil id) ->
                    case res2.value of
                        M (VCons id_ val1 val2) ->
                            case bop of
                                Cat -> { value = M (append (VNil id) (VCons id_ val1 val2)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Unknown binary operation error: 07") }
                        M (VNil id_) ->
                            { value = M (append (VNil id) (VNil id_)), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res2.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 06") }
                M (VHole _ _) ->
                    let c = findCount tempHoleCount res2.count in
                    { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                _ -> { defaultEvalRes | value = M (VError "Unsupported operand error: 07") }
        EUPrim _ uop e ->
            case uop of
                Neg ->
                    let res = eval context e count funcSummary in
                    case res.value of
                        M (VInt n) -> { value = M (VInt (0-n)), senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        M (VFloat n) -> { value = M (VFloat (0-n)), senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported unary operation error: 01") }
                Not ->
                    let res = eval context e count funcSummary in
                    case res.value of
                        M VTrue -> { value = M VFalse, senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        M VFalse -> { value = M VTrue, senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        M (VHole _ _) ->
                            let c = findCount tempHoleCount res.count in
                            { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Unsupported unary operation error: 02") }
        ECase _ e branches ->
            let res = eval context e count funcSummary in
            case res.value of
                M (VHole _ _) ->
                    let (vs, r, w) = analyzeEffectinBranches funcSummary branches in
                    let factvs = unique (findCurVars vs context.venv) in
                    -- let modvars = modVarsinExpr context expr |> unique in
                    let (senv_, count_) = update2Hole factvs context.venv context.senv count in
                    let c = findCount tempHoleCount count_ in
                    -- let (curRead, stdin__) = case context.stdin of
                    --         (stdin_, Blocked) -> (True, stdin_)
                    --         (stdin_, Normal) -> (False, stdin_)
                    -- in
                    -- let (read, write) = checkIOState context branches in
                    let 
                        stdin__ = 
                            case (context.stdin, r) of
                                ((stdin_, Blocked), _) -> (stdin_, Blocked)
                                ((stdin_, _), True) -> (stdin_, Blocked)
                                _ -> context.stdin

                        (stdout__, count__, c_) = 
                            case (context.stdout, w) of
                                ((stdout_, _), True) -> (((VHole (HInter (c+1)) (context.venv, context.senv))::stdout_, Blocked), (tempHoleCount, c+1)::count_, c+1)
                                _ -> (context.stdout, count_, c)
                    in
                    { value = M (VHole (HInter (c_+1)) (context.venv, context.senv)), senv = senv_, count = (tempHoleCount, c_+1)::count__, stdin = stdin__, stdout = stdout__ }               
                M val ->
                    let matchResult = matchCase val branches in
                    case matchResult.venvm of
                        [(_, VError info)] -> { defaultEvalRes | value = M (VError ("guard of case evalution:"++info)) }
                        _ -> 
                            let (venv_, senv_) = applyMatchResult matchResult.venvm context.venv context.senv in
                            eval { context | venv = venv_, senv = senv_, stdin = res.stdin, stdout = res.stdout} matchResult.ei res.count funcSummary
                _ -> { defaultEvalRes | value = M (VError "Guard of case expression is a function closure") }
        EFix _ e ->
            eval context (EApp defaultWS e (EFix defaultWS e)) count funcSummary
        EBTuple _ e1 e2 ->
            let res1 = eval context e1 count funcSummary in
            case res1.value of
                M (VError info) -> { defaultEvalRes | value = M (VError ("Error in 1st element of BTuple:" ++ info)) }
                M val1 ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count funcSummary in
                    case res2.value of
                        M(VError info) -> { defaultEvalRes | value = M (VError ("Error in 2nd element of BTuple:" ++ info)) }
                        M val2 ->
                            { value = M (VBTuple val1 val2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = M (VError "Function closure as 2nd element of BTuple") }
                _ -> { defaultEvalRes | value = M (VError "Function closure as 1st element of BTuple") }
        ETTuple _ e1 e2 e3 ->
            let res1 = eval context e1 count funcSummary in
            case res1.value of
                M (VError info) -> { defaultEvalRes | value = M (VError ("Error in 1st element of TTuple:" ++ info)) }
                M val1 ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count funcSummary in
                    case res2.value of
                        M(VError info) -> { defaultEvalRes | value = M (VError ("Error in 2nd element of TTuple:" ++ info)) }
                        M val2 ->
                            let res3 = eval { context | senv = res2.senv, stdin = res2.stdin, stdout = res2.stdout} e3 res2.count funcSummary in
                            case res3.value of
                                M(VError info) -> { defaultEvalRes | value = M (VError ("Error in 3rd element of TTuple:" ++ info)) }
                                M val3 ->
                                    { value = M (VTTuple val1 val2 val3), senv = res3.senv, count = res3.count, stdin = res3.stdin, stdout = res3.stdout }
                                _ -> { defaultEvalRes | value = M (VError "Function closure as 3rd element of TTuple") }
                        _ -> { defaultEvalRes | value = M (VError "Function closure as 2nd element of TTuple") }
                _ -> { defaultEvalRes | value = M (VError "Function closure as 1st element of TTuple") }
        EPrint _ e ->
            let res = eval context e count funcSummary in
            -- case (res.value, res.stdout) of
            --     (M (VError info), _) -> { defaultEvalRes | value = M (VError info) }
            --     (_, (stdout_, Blocked)) -> 
            --         let
            --             c = findCount tempHoleCount count
            --         in
            --         { value = M VUnit, senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = (stdout_ ++ [VHole (HInter (c+1)) (context.venv, context.senv)], Blocked) }
            --     (M val, (stdout_, Normal)) -> 
            --         { value = M VUnit, senv = res.senv, count = res.count, stdin = res.stdin, stdout = (stdout_ ++ [val], Normal) }
            --     _ -> { defaultEvalRes | value = M (VError "Error in Print") }
            case res.value of
                M (VError info) -> { defaultEvalRes | value = M (VError info) }
                M val ->
                    case res.stdout of
                        (stdout_, state) -> { value = M VUnit, senv = res.senv, count = res.count, stdin = res.stdin, stdout = (stdout_ ++ [val], state) }
                _ -> { defaultEvalRes | value = M (VError "Error in Print") }
        ERead _ ->
            case context.stdin of
                (_, Blocked) -> 
                    let
                        c = findCount tempHoleCount count
                    in
                    { value = M (VHole (HInter (c+1)) (context.venv, context.senv)), senv = context.senv, count = (tempHoleCount, c+1)::count, stdin = context.stdin, stdout = context.stdout }
                (val :: ls, _) -> { value = M val, senv = context.senv, count = count, stdin = (ls, Normal), stdout = context.stdout }
                ([], _) -> { defaultEvalRes | value = M (VError "No input found") }
        EError info ->
            { defaultEvalRes | value = M (VError info) }
        

findCount : HoleName -> List (HoleName, Int) -> Int
findCount hn count =
    case count of
        (HInter 0, n)::_ -> n
        (hn_, n)::ct ->
            if hn == hn_
            then n
            else findCount hn ct
        [] -> 0


findValue : HoleName -> VEnv -> SEnv-> HEnv -> Maybe MValue
findValue u venv senv henv =
    case henv of

        [] -> Nothing

        (u_, (venv_, senv_), v_)::ls ->
            if u_ == u && venv_ == venv && senv_ == senv
            then Just v_
            else findValue u venv senv ls

boolOp : Bool -> MValue
boolOp p =
    if p then VTrue else VFalse

floatOp : Bop -> Float -> Float -> MValue
floatOp op n1 n2 =
    case op of
        Add -> VFloat (n1 + n2)
        Sub -> VFloat (n1 - n2)
        Mul -> VFloat (n1 * n2)
        Div -> VFloat (n1 / n2)
        DDiv -> VFloat (n1 / n2)
        Eq -> boolOp (n1 == n2)
        Lt -> boolOp (n1 < n2)
        Gt -> boolOp (n1 > n2)
        Le -> boolOp (n1 <= n2)
        Ge -> boolOp (n1 >= n2)
        _  -> VError "Float Operation Error: 01"

-- modVarsinExpr : Context ->Expr -> List String
-- modVarsinExpr context expr =
--     case expr of
--         EParens _ e -> modVarsinExpr context e
--         ELam _ _ _ -> [] -- No execution, only function closure
--         ELet _ p e1 e2 ->
--             case (p, e1) of
--                 (PVar _ x, ELam _ p_ e_) -> modVarsinExpr { context | venv = (x, VClosure p_ e_ context.venv)::context.venv} e2
--                 (_, ELam _ _ _) -> ["error"]
--                 _ -> 
--                     let 
--                         v1 = modVarsinPat p 
--                         v2 = modVarsinExpr context e1
--                         v3 = modVarsinExpr context e2
--                     in
--                     case (v1, v2, v3) of
--                         (["error"], _, _) -> ["error"]
--                         (_, ["error"], _) -> ["error"]
--                         (_, _, ["error"]) -> ["error"]
--                         _ -> v1 ++ v2 ++ v3
--         ELetrec _ p e1 e2 ->
--             case (p, e1) of
--                 (PVar _ x, ELam _ p_ e_) -> modVarsinExpr { context | venv = (x, VFix (ELam p_ e_ context.venv))::context.venv} e2
--                 _ -> ["error"]
--         EApp _ e1 e2 ->
--             -- 不考虑高阶函数，那么e1是不是就不需要计算？
--             case e1 of
--                 EVar _ x -> 
--                     let clo = findVarByName x context.venv in
--                     case clo of
--                         Just (VClosure p_ e_ venv_) -> (modVarsinExpr { context | venv = venv_} e_) ++ modVarsinExpr context e2
--                         Just (VFix (ELam p_ e_ venv_)) -> []
--                         _ -> modVarsinExpr e2
--                 _ -> ["error"]
--         EBPrim _ _ e1 e2 ->
--             modVarsinExpr e1 ++ modVarsinExpr e2
--         EUPrim _ _ e ->
--             modVarsinExpr e
--         ECase _ e branches ->
--             modVarsinExpr e ++ modVarsinBranch branches
--         EBTuple _ e1 e2 ->
--             modVarsinExpr e1 ++ modVarsinExpr e2
--         ETTuple _ e1 e2 e3 ->
--             modVarsinExpr e1 ++ modVarsinExpr e2 ++ modVarsinExpr e3
--         _ -> []


modVarsinPat : Pattern -> List String
modVarsinPat p = 
    case p of
        PVar _ x -> [x]
        PCons _ p1 p2 -> modVarsinPat p1 ++ modVarsinPat p2
        PBTuple _ p1 p2 -> modVarsinPat p1 ++ modVarsinPat p2
        PTTuple _ p1 p2 p3 -> modVarsinPat p1 ++ modVarsinPat p2 ++ modVarsinPat p3
        _ -> []

-- modVarsinBranch : Branch -> List String
-- modVarsinBranch branch =
--     case branch of
--         BSin _ _ e -> modVarsinExpr e
--         BNSin _ _ p e -> modVarsinExpr e
--         BCom _ b1 b2 -> modVarsinBranch b1 ++ modVarsinBranch b2

update2Hole : List String -> VEnv -> SEnv -> List (HoleName, Int) -> (SEnv, List (HoleName, Int))
update2Hole modvars venv senv count =
    case venv of
        [] -> (senv, count)
        (x, Loc l) :: vs ->
            if List.member x modvars then
                let c = findCount tempHoleCount count in
                let senv_ = updStore l (VHole (HInter (c+1)) (venv, senv)) senv in
                update2Hole modvars vs senv_ ((tempHoleCount, c+1)::count)
            else
                update2Hole modvars vs senv count
        _ :: vs -> update2Hole modvars vs senv count


-- checkIOState : Context -> Branch -> (Bool, Bool)
-- checkIOState context expr =
--     case expr of
--         EPrint _ _ -> (read, True)
--         ERead _ -> (True, False)
--         EParens _ e -> 
--             let (read_, write_) = checkIOState context e read in
--             (read_ || read, write_)
--         EVar _ s -> (read, False)
--         ELam _ _ e -> (read, False)
--         ELet _ _ e1 e2 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             (read1 || read2, write1 || write2)
--         ELetrec _ _ e1 e2 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             (read1 || read2, write1 || write2)
--         EApp _ e1 e2 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             (read1 || read2, write1 || write2)
--         EBPrim _ _ e1 e2 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             (read1 || read2, write1 || write2)
--         EUPrim _ _ e -> 
--             checkIOState e (read, write)
--         ECase _ e branches -> 
--             let (read1, write1) = checkIOState e (read, write) in
--             checkIOStateBranch branches (read1, write1)
--         EBTuple _ e1 e2 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             (read1 || read2, write1 || write2)
--         ETTuple _ e1 e2 e3 -> 
--             let (read1, write1) = checkIOState e1 (read, write) in
--             let (read2, write2) = checkIOState e2 (read1, write1) in
--             let (read3, write3) = checkIOState e3 (read2, write2) in
--             (read1 || read2 || read3, write1 || write2 || write3)
--         _ -> (read, write)
        

-- checkIOStateBranch : Branch -> (Bool, Bool) -> (Bool, Bool)
-- checkIOStateBranch branch (read, write) =
--     case branch of
--         BSin _ _ e -> checkIOState e (read, write)
--         BNSin _ _ _ e -> checkIOState e (read, write)
--         BCom _ b1 b2 -> 
--             let (read1, write1) = checkIOStateBranch b1 (read, write) in
--             let (read2, write2) = checkIOStateBranch b2 (read1, write1) in
--             (read1 || read2, write1 || write2)


analyzeEffect : FuncSummary -> Expr -> (List String, Bool, Bool)
analyzeEffect funcSummary expr =
    case expr of
        EParens _ e -> analyzeEffect funcSummary e
        ELam _ _ _ -> ([], False, False)
        ELet _ p e1 e2 -> 
            case (p, e1) of
                (PVar _ x, ELam _ _ e_) -> 
                    let tempRecord = analyzeEffect funcSummary e_ in
                    case tempRecord of
                        (["error"], _, _) -> (["error"], False, False)
                        _ -> analyzeEffect ((x, tempRecord)::funcSummary) e2
                (_, ELam _ _ _) -> (["error"], False, False)
                _ -> 
                    let 
                        v1 = modVarsinPat p 
                        v2 = analyzeEffect funcSummary e1
                        v3 = analyzeEffect funcSummary e2
                    in
                    case (v1, v2, v3) of
                        (["error"], _, _) -> (["error"], False, False)
                        (_, (["error"], _, _), _) -> (["error"], False, False)
                        (_, _, (["error"], _, _)) -> (["error"], False, False)
                        (_, (v2_, r2, w2), (v3_, r3, w3)) -> (v1 ++ v2_ ++ v3_, r2 || r3, w2 || w3)
        ELetrec _ (PVar _ x) (ELam _ _ e_) e2 ->
            let tempRecord = (x, ([], False, False)) in
            case analyzeEffect (tempRecord::funcSummary) e_ of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> analyzeEffect ((x, (vs, r, w))::funcSummary) e2
        EVar _ x -> 
            case findFuncByName x funcSummary of
                Just (vs, r, w) -> (vs, r, w)
                Nothing -> ([], False, False)
        EApp _ e1 e2 ->
            case analyzeEffect funcSummary e1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffect funcSummary e2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs ++ vs2, r || r2, w || w2)
        EInt _ _ -> ([], False, False)
        EFloat _ _ -> ([], False, False)
        ETrue _ -> ([], False, False)
        EFalse _ -> ([], False, False)
        EChar _ _ -> ([], False, False)
        ECons _ e1 e2 ->
            case analyzeEffect funcSummary e1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffect funcSummary e2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs ++ vs2, r || r2, w || w2)
        ENil _ -> ([], False, False)
        EHole _ _ -> ([], False, False)
        EBPrim _ _ e1 e2 ->
            case analyzeEffect funcSummary e1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffect funcSummary e2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs ++ vs2, r || r2, w || w2)
        EUPrim _ _ e -> analyzeEffect funcSummary e
        ECase _ e branches ->
            case analyzeEffect funcSummary e of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffectinBranches funcSummary branches of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs ++ vs2, r || r2, w || w2)
        EBTuple _ e1 e2 ->
            case analyzeEffect funcSummary e1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffect funcSummary e2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs ++ vs2, r || r2, w || w2)
        ETTuple _ e1 e2 e3 -> 
            case analyzeEffect funcSummary e1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> 
                    case analyzeEffect funcSummary e2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> 
                            case analyzeEffect funcSummary e3 of
                                (["error"], _, _) -> (["error"], False, False)
                                (vs3, r3, w3) -> (vs ++ vs2 ++ vs3, r || r2 || r3, w || w2 || w3)
        EPrint _ e -> 
            case analyzeEffect funcSummary e of
                (["error"], _, _) -> (["error"], False, False)
                (vs, r, w) -> (vs, r, w || True)
        ERead _ -> ([], True, False)
        _ -> (["error"], False, False)

findFuncByName : String -> FuncSummary -> Maybe (List String, Bool, Bool)
findFuncByName x funcSummary =
    case funcSummary of
        [] -> Nothing
        (x_, (vs, r, w)) :: fs -> if x_ == x then Just (vs, r, w) else findFuncByName x fs

analyzeEffectinBranches : FuncSummary -> Branch -> (List String, Bool, Bool)
analyzeEffectinBranches funcSummary branches =
    case branches of
        BSin _ _ e -> analyzeEffect funcSummary e
        BNSin _ _ _ e -> analyzeEffect funcSummary e
        BCom _ b1 b2 -> 
            case analyzeEffectinBranches funcSummary b1 of
                (["error"], _, _) -> (["error"], False, False)
                (vs1, r1, w1) ->
                    case analyzeEffectinBranches funcSummary b2 of
                        (["error"], _, _) -> (["error"], False, False)
                        (vs2, r2, w2) -> (vs1 ++ vs2, r1 || r2, w1 || w2)



findCurVars : List String -> VEnv -> List String
findCurVars vs venv =
    case vs of
        [] -> []
        x :: xs ->
            if List.member x (List.map Tuple.first venv) then x :: findCurVars xs venv else findCurVars xs venv