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
    { value = VError "Default Evaluation Result"
    , senv = []
    , count = []
    , stdin = ([], Normal)
    , stdout = ([], Normal)
    }

eval : Context -> Expr -> List (HoleName, Int) -> EvalRes
eval context expr count =
    case expr of
        EParens _ e ->
            eval context e count
        EVar _ x ->
            case findVarByName x context.venv of
                Just (Loc l) -> 
                    let val = findValByLoc l context.senv in
                    case val of
                        VFix e -> eval context (EFix defaultWS e) count
                        _ ->{ value = val, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Just v -> { value = v, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Nothing ->
                    { defaultEvalRes | value = VError "Variable not found" }
        ELam _ p e ->
            { value = VClosure p e context.venv, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ELet _ p e1 e2 ->
            let res = eval context e1 count in
            let matchResult = match p res.value in
            case matchResult of
                [(_, VError info)] -> { defaultEvalRes | value = VError info }
                _ -> 
                    let (venv_, senv_) = applyMatchResult matchResult context.venv context.senv in
                    eval { venv = venv_, senv = senv_, henv = context.henv, stdin = res.stdin, stdout = res.stdout} e2 res.count
        ELetrec _ p e1 e2 ->
            eval context (EApp defaultWS (ELam defaultWS p e2) (EFix defaultWS (ELam defaultWS p e1))) count
            -- case p of
            --     PVar _ x ->
            --         let venv_ = (x, length context.senv) :: context.venv in
            --         let res = eval {context | venv = venv_ } e1 count in
            --         case res.value of
            --             VClosure _ _ _ -> 
            --                 eval { venv = venv_, senv = context.senv ++ [res.value], henv = context.henv, stdin = res.stdin, stdout = res.stdout} e2 res.count
            --             _ -> { defaultEvalRes | value = VError "Recursive binding is only allowed for single variable" }
            --     _ -> { defaultEvalRes | value = VError "Recursive binding is only allowed for single variable" }
        EApp _ e1 e2 ->
            let res1 = eval context e1 count in
            case res1.value of
                VClosure p e venvf ->
                    case e2 of
                        EFix _ e_ -> 
                            case p of
                                PVar _ x ->
                                    eval { context | venv = (x, length context.senv) :: context.venv, senv = res1.senv ++ [VFix e_], stdin = res1.stdin, stdout = res1.stdout } e res1.count
                                _ -> { defaultEvalRes | value = VError "Recursive binding is only allowed for single variable" }
                        _ ->
                            let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count in
                            let matchResult = match p res2.value in
                            case matchResult of
                                [(_, VError info)] -> { defaultEvalRes | value = VError info }
                                _ -> 
                                    let (venv_, senv_) = applyArgs matchResult (length res2.senv) in
                                    let resf = eval { venv = venv_ ++ venvf, senv = res2.senv ++ senv_, henv = context.henv, stdin = res2.stdin, stdout = res2.stdout} e res2.count in
                                    { resf | senv = List.take (List.length context.senv) resf.senv }
                _ -> { defaultEvalRes | value = VError "Function application error" }
        EInt _ n ->
            { value = VInt n, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EFloat _ f ->
            { value = VFloat f, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ETrue _ ->
            { value = VTrue, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EFalse _ ->
            { value = VFalse, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EChar _ c ->
            { value = VChar c, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        ECons (_, id) e1 e2 ->
            let
                res1 = eval context e1 count in
            case res1.value of
                VError info -> { defaultEvalRes | value = VError info }
                _ ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count
                    in
                    case res2.value of
                        VError info -> { defaultEvalRes | value = VError info }
                        VHole _ _ -> 
                            let 
                                c = 
                                    findCount tempHoleCount count 
                            in
                                { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = res2.senv, count = (tempHoleCount, c+1)::count, stdin = res2.stdin, stdout = res2.stdout }
                        _ ->
                            if id == esQuo || id == esElm then
                                { value = VCons vsId res1.value res2.value, senv = res2.senv, count = count, stdin = res2.stdin, stdout = res2.stdout }
                            else
                                { value = VCons voId res1.value res2.value, senv = res2.senv, count = count, stdin = res2.stdin, stdout = res2.stdout }
        ENil (_, id) ->
            if id == 3 || id == 4 then
                { value = VNil 1, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
            else
                { value = VNil 0, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
        EHole _ hn ->
            let v = findValue hn context.venv context.senv context.henv in
            case v of
                Just v_ -> { value = v_, senv = context.senv, count = count, stdin = context.stdin, stdout = context.stdout }
                Nothing ->
                    let c = findCount hn count in
                    { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = context.senv, count = (hn, c+1)::count, stdin = context.stdin, stdout = context.stdout }
        EBPrim _ bop e1 e2 ->
            let res1 = eval context e1 count in
            let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count in
            case res1.value of
                VInt n1 ->
                    case res2.value of
                        VInt n2 ->
                            case bop of
                                Add -> { value = VInt (n1 + n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Sub -> { value = VInt (n1 - n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Mul -> { value = VInt (n1 * n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Div -> { value = VInt (n1 // n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                DDiv -> { value = VFloat (Round.roundNumCom 2 <| ((toFloat n1) / (toFloat n2))), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Eq -> { value = boolOp (n1 == n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Lt -> { value = boolOp (n1 < n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Gt -> { value = boolOp (n1 > n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Le -> { value = boolOp (n1 <= n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Ge -> { value = boolOp (n1 >= n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 01" }
                        VFloat n2 -> { value = floatOp bop (toFloat n1) n2, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 01" }
                VFloat n1 ->
                    case res2.value of
                        VInt n2 -> { value = floatOp bop n1 (toFloat n2), senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VFloat n2 -> { value = floatOp bop n1 n2, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 02" }
                VTrue ->
                    case res2.value of
                        VTrue -> 
                            case bop of
                                And -> { value = VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 02" }
                        VFalse ->
                            case bop of
                                And -> { value = VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 03" }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 03" }
                VFalse ->
                    case res2.value of
                        VTrue ->
                            case bop of
                                And -> { value = VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 04" }
                        VFalse ->
                            case bop of
                                And -> { value = VFalse, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 05" }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 04" }
                VCons _ _ _ ->
                    case res2.value of
                        VCons _ _ _ ->
                            case bop of
                                Cat -> { value = append res1.value res2.value, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 06" }
                        VNil _ ->
                            { value = append res1.value res2.value, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 05" }
                VNil _ ->
                    case res2.value of
                        VCons _ _ _ ->
                            case bop of
                                Cat -> { value = append res1.value res2.value, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { defaultEvalRes | value = VError "Unknown binary operation error: 07" }
                        VNil _ ->
                            { value = append res1.value res2.value, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported operand error: 06" }
                VHole _ _ ->
                    let c = findCount tempHoleCount res2.count in
                    { value = VHole (HInter (c+1)) (context.venv, res2.senv), senv = res2.senv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                _ -> { defaultEvalRes | value = VError "Unsupported operand error: 07" }
        EUPrim _ uop e ->
            case uop of
                Neg ->
                    let res = eval context e count in
                    case res.value of
                        VInt n -> { value = VInt (0-n), senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VFloat n -> { value = VFloat (0-n), senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res.count in
                            { value = VHole (HInter (c+1)) (context.venv, res.senv), senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported unary operation error: 01" }
                Not ->
                    let res = eval context e count in
                    case res.value of
                        VTrue -> { value = VFalse, senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VFalse -> { value = VTrue, senv = res.senv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res.count in
                            { value = VHole (HInter (c+1)) (context.venv, res.senv), senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { defaultEvalRes | value = VError "Unsupported unary operation error: 02" }
        ECase _ e branches ->
            let res = eval context e count in
            case res.value of
                VHole _ _ ->
                    let modvars = modVarsinExpr expr |> unique in
                    let (senv_, count_) = updateIntersect modvars context.venv context.senv count in
                    let c = findCount tempHoleCount count_ in
                    let (curRead, curWrite, (stdin__, stdout__)) = case (context.stdin, context.stdout) of
                            ((stdin_, Blocked), (stdout_, Blocked)) -> (True, True, (stdin_, stdout_))
                            ((stdin_, Blocked), (stdout_, Normal)) -> (True, False, (stdin_, stdout_))
                            ((stdin_, Normal), (stdout_, Blocked)) -> (False, True, (stdin_, stdout_))
                            ((stdin_, Normal), (stdout_, Normal)) -> (False, False, (stdin_, stdout_))
                    in
                    let (read, write) = checkIOState expr (curRead, curWrite) in
                    case (read, write) of
                        (True, True) -> { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = senv_, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Blocked), stdout = (stdout__, Blocked) }               
                        (True, False) -> { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = senv_, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Blocked), stdout = (stdout__, Normal) } 
                        (False, True) -> { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = senv_, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Normal), stdout = (stdout__, Blocked) } 
                        (False, False) -> { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = senv_, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Normal), stdout = (stdout__, Normal) } 
                _ ->
                    let matchResult = matchCase res.value branches in
                    case matchResult.venvm of
                        [(_, VError info)] -> { defaultEvalRes | value = VError info }
                        _ -> 
                            let (venv_, senv_) = applyMatchResult matchResult.venvm context.venv context.senv in
                            eval { context | venv = venv_, senv = senv_, stdin = res.stdin, stdout = res.stdout} matchResult.ei res.count
        EFix _ e ->
            eval context (EApp defaultWS e (EFix defaultWS e)) count
        EBTuple _ e1 e2 ->
            let res1 = eval context e1 count in
            case res1.value of
                VError info -> { defaultEvalRes | value = VError info }
                _ ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count in
                    case res2.value of
                        VError info -> { defaultEvalRes | value = VError info }
                        _ ->
                            { value = VBTuple res1.value res2.value, senv = res2.senv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
        ETTuple _ e1 e2 e3 ->
            let res1 = eval context e1 count in
            case res1.value of
                VError info -> { defaultEvalRes | value = VError info }
                _ ->
                    let res2 = eval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 res1.count in
                    case res2.value of
                        VError info -> { defaultEvalRes | value = VError info }
                        _ ->
                            let res3 = eval { context | senv = res2.senv, stdin = res2.stdin, stdout = res2.stdout} e3 res2.count in
                            case res3.value of
                                VError info -> { defaultEvalRes | value = VError info }
                                _ ->
                                    { value = VTTuple res1.value res2.value res3.value, senv = res3.senv, count = res3.count, stdin = res3.stdin, stdout = res3.stdout }
        EPrint _ e ->
            let res = eval context e count in
            case (res.value, res.stdout) of
                (VError info, _) -> { defaultEvalRes | value = VError info }
                (_, (stdout_, Blocked)) -> 
                    let
                        c = findCount tempHoleCount count
                    in
                    { value = VUnit, senv = res.senv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = (stdout_ ++ [VHole (HInter (c+1)) (context.venv, context.senv)], Blocked) }
                (_, (stdout_, Normal)) -> 
                    { value = VUnit, senv = res.senv, count = res.count, stdin = res.stdin, stdout = (stdout_ ++ [res.value], Normal) }
        ERead _ ->
            case context.stdin of
                (_, Blocked) -> 
                    let
                        c = findCount tempHoleCount count
                    in
                    { value = VHole (HInter (c+1)) (context.venv, context.senv), senv = context.senv, count = (tempHoleCount, c+1)::count, stdin = context.stdin, stdout = context.stdout }
                (val :: ls, _) -> { value = val, senv = context.senv, count = count, stdin = (ls, Normal), stdout = context.stdout }
                ([], _) -> { defaultEvalRes | value = VError "No input found" }
        EError info ->
            { defaultEvalRes | value = VError info }
        

findCount : HoleName -> List (HoleName, Int) -> Int
findCount hn count =
    case count of
        (HInter 0, n)::_ -> n
        (hn_, n)::ct ->
            if hn == hn_
            then n
            else findCount hn ct
        [] -> 0


findValue : HoleName -> VEnv -> SEnv-> HEnv -> Maybe Value
findValue u venv senv henv =
    case henv of

        [] -> Nothing

        (u_, (venv_, senv_), v_)::ls ->
            if u_ == u && venv_ == venv && senv_ == senv
            then Just v_
            else findValue u venv senv ls

boolOp : Bool -> Value
boolOp p =
    if p then VTrue else VFalse

floatOp : Bop -> Float -> Float -> Value
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

modVarsinExpr : Expr -> List String
modVarsinExpr expr =
    case expr of
        EParens _ e -> modVarsinExpr e
        ELam _ p e -> modVarsinExpr e
        ELet _ p e1 e2 ->
            modVarsinPat p ++ modVarsinExpr e1 ++ modVarsinExpr e2
        ELetrec _ p e1 e2 ->
            modVarsinPat p ++ modVarsinExpr e1 ++ modVarsinExpr e2
        EApp _ e1 e2 ->
            modVarsinExpr e1 ++ modVarsinExpr e2
        EBPrim _ _ e1 e2 ->
            modVarsinExpr e1 ++ modVarsinExpr e2
        EUPrim _ _ e ->
            modVarsinExpr e
        ECase _ e branches ->
            modVarsinExpr e ++ modVarsinBranch branches
        EBTuple _ e1 e2 ->
            modVarsinExpr e1 ++ modVarsinExpr e2
        ETTuple _ e1 e2 e3 ->
            modVarsinExpr e1 ++ modVarsinExpr e2 ++ modVarsinExpr e3
        _ -> []


modVarsinPat : Pattern -> List String
modVarsinPat p = 
    case p of
        PVar _ x -> [x]
        PCons _ p1 p2 -> modVarsinPat p1 ++ modVarsinPat p2
        PBTuple _ p1 p2 -> modVarsinPat p1 ++ modVarsinPat p2
        PTTuple _ p1 p2 p3 -> modVarsinPat p1 ++ modVarsinPat p2 ++ modVarsinPat p3
        _ -> []

modVarsinBranch : Branch -> List String
modVarsinBranch branch =
    case branch of
        BSin _ _ e -> modVarsinExpr e
        BNSin _ _ p e -> modVarsinExpr e
        BCom _ b1 b2 -> modVarsinBranch b1 ++ modVarsinBranch b2

updateIntersect : List String -> VEnv -> SEnv -> List (HoleName, Int) -> (SEnv, List (HoleName, Int))
updateIntersect modvars venv senv count =
    case venv of
        [] -> (senv, count)
        (x, l) :: vs ->
            if List.member x modvars then
                let c = findCount tempHoleCount count in
                let senv_ = updStore l (VHole (HInter (c+1)) (venv, senv)) senv in
                updateIntersect modvars vs senv_ ((tempHoleCount, c+1)::count)
            else
                updateIntersect modvars vs senv count


checkIOState : Expr -> (Bool, Bool) -> (Bool, Bool)
checkIOState expr (read, write) =
    case expr of
        EPrint _ _ -> (read, True)
        ERead _ -> (True, write)
        EParens _ e -> checkIOState e (read, write)
        EVar _ _ -> (read, write)
        ELam _ _ e -> checkIOState e (read, write)
        ELet _ _ e1 e2 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            (read1 || read2, write1 || write2)
        ELetrec _ _ e1 e2 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            (read1 || read2, write1 || write2)
        EApp _ e1 e2 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            (read1 || read2, write1 || write2)
        EBPrim _ _ e1 e2 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            (read1 || read2, write1 || write2)
        EUPrim _ _ e -> 
            checkIOState e (read, write)
        ECase _ e branches -> 
            let (read1, write1) = checkIOState e (read, write) in
            checkIOStateBranch branches (read1, write1)
        EBTuple _ e1 e2 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            (read1 || read2, write1 || write2)
        ETTuple _ e1 e2 e3 -> 
            let (read1, write1) = checkIOState e1 (read, write) in
            let (read2, write2) = checkIOState e2 (read1, write1) in
            let (read3, write3) = checkIOState e3 (read2, write2) in
            (read1 || read2 || read3, write1 || write2 || write3)
        _ -> (read, write)
        

checkIOStateBranch : Branch -> (Bool, Bool) -> (Bool, Bool)
checkIOStateBranch branch (read, write) =
    case branch of
        BSin _ _ e -> checkIOState e (read, write)
        BNSin _ _ _ e -> checkIOState e (read, write)
        BCom _ b1 b2 -> 
            let (read1, write1) = checkIOStateBranch b1 (read, write) in
            let (read2, write2) = checkIOStateBranch b2 (read1, write1) in
            (read1 || read2, write1 || write2)


