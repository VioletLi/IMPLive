module Neweval exposing (..)

import Syntax exposing (..)
import Newlangutils exposing (..)
import Round

type alias EvalRes = 
    { value : Value
    , venv : VEnv
    , senv : SEnv
    , henv : HEnv
    , count : List (HoleName, Int)
    , stdin : Stdin
    , stdout : Stdout
    }

defaultEvalRes : EvalRes
defaultEvalRes =
    { value = VError "Default Evaluation Result"
    , venv = []
    , senv = []
    , henv = []
    , count = []
    , stdin = ([], Normal)
    , stdout = ([], Normal)
    }

eval : Expr -> VEnv -> SEnv -> HEnv -> List (HoleName, Int) -> Stdin -> Stdout -> EvalRes
eval expr venv senv henv count stdin stdout =
    case expr of
        EParens _ e ->
            eval e venv senv henv count stdin stdout
        EVar _ x ->
            case findVarByName x venv of
                Just l -> 
                    let val = findValByLoc l senv in
                    { value = val, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
                Nothing ->
                    { value = VError "Variable not found", venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        ELam _ p e ->
            { value = VClosure p e venv, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        ELet _ p e1 e2 ->
            let res = eval e1 venv senv henv count stdin stdout in
            let matchResult = match p res.value in
            let (venv_, senv_) = applyMatchResult matchResult venv senv in
            eval e2 venv_ senv_ henv res.count res.stdin res.stdout
        ELetrec _ p e1 e2 ->
            case p of
                PVar _ x ->
                    let venv_ = (x, length senv) :: venv in
                    let res = eval e1 venv_ senv henv count stdin stdout in
                    eval e2 venv_ (senv++[res.value]) henv res.count res.stdin res.stdout
                _ -> {value = VError "Recursive binding is only allowed for single variable", venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EApp _ e1 e2 ->
            let res1 = eval e1 venv senv henv count stdin stdout in
            case res1.value of
                VClosure p e venvf ->
                    eval (ELet defaultWS p e2 e) venvf res1.senv henv res1.count res1.stdin res1.stdout
                _ -> {value = VError "Function application error", venv = venv, senv = senv, henv = henv, count = count, stdin = res1.stdin, stdout = res1.stdout }
        EInt _ n ->
            { value = VInt n, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EFloat _ f ->
            { value = VFloat f, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        ETrue _ ->
            { value = VTrue, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EFalse _ ->
            { value = VFalse, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EChar _ c ->
            { value = VChar c, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        ECons (_, id) e1 e2 ->
            let
                res1 = eval e1 venv senv henv count stdin stdout
                res2 = eval e2 venv res1.senv henv res1.count res1.stdin res1.stdout
            in
            case res2.value of
                VHole _ _ -> 
                    let 
                        c = 
                            findCount tempHoleCount count 
                    in
                        { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv, henv = henv, count = (tempHoleCount, c+1)::count, stdin = res2.stdin, stdout = res2.stdout }
                _ ->
                    if id == esQuo || id == esElm then
                        { value = VCons vsId res1.value res2.value, venv = venv, senv = senv, henv = henv, count = count, stdin = res2.stdin, stdout = res2.stdout }
                    else
                        { value = VCons voId res1.value res2.value, venv = venv, senv = senv, henv = henv, count = count, stdin = res2.stdin, stdout = res2.stdout }
        ENil (_, id) ->
            if id == 3 || id == 4 then
                { value = VNil 1, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
            else
                { value = VNil 0, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EHole _ hn ->
            let v = findValue hn venv senv henv in
            case v of
                Just v_ -> { value = v_, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
                Nothing ->
                    let c = findCount hn count in
                    { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv, henv = henv, count = (hn, c+1)::count, stdin = stdin, stdout = stdout }
        EBPrim _ bop e1 e2 ->
            let res1 = eval e1 venv senv henv count stdin stdout in
            let res2 = eval e2 venv res1.senv henv res1.count res1.stdin res1.stdout in
            case res1.value of
                VInt n1 ->
                    case res2.value of
                        VInt n2 ->
                            case bop of
                                Add -> { value = VInt (n1 + n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Sub -> { value = VInt (n1 - n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Mul -> { value = VInt (n1 * n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Div -> { value = VInt (n1 // n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                DDiv -> { value = VFloat (Round.roundNumCom 2 <| ((toFloat n1) / (toFloat n2))), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Eq -> { value = boolOp (n1 == n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Lt -> { value = boolOp (n1 < n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Gt -> { value = boolOp (n1 > n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Le -> { value = boolOp (n1 <= n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Ge -> { value = boolOp (n1 >= n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 01", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VFloat n2 -> { value = floatOp bop (toFloat n1) n2, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 01", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VFloat n1 ->
                    case res2.value of
                        VInt n2 -> { value = floatOp bop n1 (toFloat n2), venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VFloat n2 -> { value = floatOp bop n1 n2, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 02", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VTrue ->
                    case res2.value of
                        VTrue -> 
                            case bop of
                                And -> { value = VTrue, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 02", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VFalse ->
                            case bop of
                                And -> { value = VFalse, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 03", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 03", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VFalse ->
                    case res2.value of
                        VTrue ->
                            case bop of
                                And -> { value = VFalse, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 04", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VFalse ->
                            case bop of
                                And -> { value = VFalse, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                Or -> { value = VTrue, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 05", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 04", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VCons _ _ _ ->
                    case res2.value of
                        VCons _ _ _ ->
                            case bop of
                                Cat -> { value = append res1.value res2.value, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 06", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VNil _ ->
                            { value = append res1.value res2.value, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 05", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VNil _ ->
                    case res2.value of
                        VCons _ _ _ ->
                            case bop of
                                Cat -> { value = append res1.value res2.value, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                                _ -> { value = VError "Unknown binary operation error: 07", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VNil _ ->
                            { value = append res1.value res2.value, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res2.count in
                            { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                        _ -> { value = VError "Unsupported operand error: 06", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
                VHole _ _ ->
                    let c = findCount tempHoleCount res2.count in
                    { value = VHole (HInter (c+1)) (venv, res2.senv), venv = venv, senv = res2.senv, henv = henv, count = (tempHoleCount, c+1)::res2.count, stdin = res2.stdin, stdout = res2.stdout }
                _ -> { value = VError "Unsupported operand error: 07", venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
        EUPrim _ uop e ->
            case uop of
                Neg ->
                    let res = eval e venv senv henv count stdin stdout in
                    case res.value of
                        VInt n -> { value = VInt (0-n), venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VFloat n -> { value = VFloat (0-n), venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res.count in
                            { value = VHole (HInter (c+1)) (venv, res.senv), venv = venv, senv = res.senv, henv = henv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { value = VError "Unsupported unary operation error: 01", venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                Not ->
                    let res = eval e venv senv henv count stdin stdout in
                    case res.value of
                        VTrue -> { value = VFalse, venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VFalse -> { value = VTrue, venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
                        VHole _ _ ->
                            let c = findCount tempHoleCount res.count in
                            { value = VHole (HInter (c+1)) (venv, res.senv), venv = venv, senv = res.senv, henv = henv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = res.stdout }
                        _ -> { value = VError "Unsupported unary operation error: 02", venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = res.stdout }
        ECase _ e branches ->
            let res = eval e venv senv henv count stdin stdout in
            case res.value of
                VHole _ _ ->
                    let modvars = modVarsinExpr expr |> unique in
                    let (senv_, count_) = updateIntersect modvars venv senv count in
                    let c = findCount tempHoleCount count_ in
                    let (curRead, curWrite, (stdin__, stdout__)) = case (stdin, stdout) of
                            ((stdin_, Blocked), (stdout_, Blocked)) -> (True, True, (stdin_, stdout_))
                            ((stdin_, Blocked), (stdout_, Normal)) -> (True, False, (stdin_, stdout_))
                            ((stdin_, Normal), (stdout_, Blocked)) -> (False, True, (stdin_, stdout_))
                            ((stdin_, Normal), (stdout_, Normal)) -> (False, False, (stdin_, stdout_))
                    in
                    let (read, write) = checkIOState expr (curRead, curWrite) in
                    case (read, write) of
                        (True, True) -> { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv_, henv = henv, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Blocked), stdout = (stdout__, Blocked) }               
                        (True, False) -> { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv_, henv = henv, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Blocked), stdout = (stdout__, Normal) } 
                        (False, True) -> { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv_, henv = henv, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Normal), stdout = (stdout__, Blocked) } 
                        (False, False) -> { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv_, henv = henv, count = (tempHoleCount, c+1)::count_, stdin = (stdin__, Normal), stdout = (stdout__, Normal) } 
                _ ->
                    let matchResult = matchCase res.value branches in
                    let (venv_, senv_) = applyMatchResult matchResult.venvm venv senv in
                    eval matchResult.ei venv_ senv_ henv res.count res.stdin res.stdout
        -- EFix _ e ->
        --     defaultEvalRes
        EBTuple _ e1 e2 ->
            let res1 = eval e1 venv senv henv count stdin stdout in
            let res2 = eval e2 venv res1.senv henv res1.count res1.stdin res1.stdout in
            { value = VBTuple res1.value res2.value, venv = venv, senv = res2.senv, henv = henv, count = res2.count, stdin = res2.stdin, stdout = res2.stdout }
        ETTuple _ e1 e2 e3 ->
            let res1 = eval e1 venv senv henv count stdin stdout in
            let res2 = eval e2 venv res1.senv henv res1.count res1.stdin res1.stdout in
            let res3 = eval e3 venv res2.senv henv res2.count res2.stdin res2.stdout in
            { value = VTTuple res1.value res2.value res3.value, venv = venv, senv = res3.senv, henv = henv, count = res3.count, stdin = res3.stdin, stdout = res3.stdout }
        EPrint _ e ->
            let res = eval e venv senv henv count stdin stdout in
            case res.stdout of
                (stdout_, Blocked) -> 
                    let
                        c = findCount tempHoleCount count
                    in
                    { value = VUnit, venv = venv, senv = res.senv, henv = henv, count = (tempHoleCount, c+1)::res.count, stdin = res.stdin, stdout = (stdout_ ++ [VHole (HInter (c+1)) (venv, senv)], Blocked) }
                (stdout_, Normal) -> 
                    { value = VUnit, venv = venv, senv = res.senv, henv = henv, count = res.count, stdin = res.stdin, stdout = (stdout_ ++ [res.value], Normal) }
        ERead _ ->
            case stdin of
                (_, Blocked) -> 
                    let
                        c = findCount tempHoleCount count
                    in
                    { value = VHole (HInter (c+1)) (venv, senv), venv = venv, senv = senv, henv = henv, count = (tempHoleCount, c+1)::count, stdin = stdin, stdout = stdout }
                (val :: ls, _) -> { value = val, venv = venv, senv = senv, henv = henv, count = count, stdin = (ls, Normal), stdout = stdout }
                ([], _) -> { value = VError "No input found", venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        EError info ->
            { value = VError info, venv = venv, senv = senv, henv = henv, count = count, stdin = stdin, stdout = stdout }
        

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