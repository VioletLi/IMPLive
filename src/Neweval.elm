module Neweval exposing (..)

import Syntax exposing (..)

type alias EvalRes = 
    { value : Value
    , venv : VEnv
    , senv : SEnv
    , henv : HEnv
    , count : List (HoleName, Int)
    }

defaultEvalRes : EvalRes
defaultEvalRes =
    { value = VError "Default Evaluation Result"
    , venv = []
    , senv = []
    , henv = []
    , count = []
    }

eval : Expr -> VEnv -> SEnv -> HEnv -> List (HoleName, Int) -> EvalRes
eval expr venv senv henv count =
    case expr of
        EParens _ e ->
            eval e venv senv henv count
        EVar _ x ->
            -- case lookup x venv of
            defaultEvalRes
        ELam _ p e ->
            defaultEvalRes
        ELet _ p e1 e2 ->
            defaultEvalRes
        ELetrec _ p e1 e2 ->
            defaultEvalRes
        EApp _ e1 e2 ->
            defaultEvalRes
        EInt _ n ->
            { value = VInt n, venv = venv, senv = senv, henv = henv, count = count }
        EFloat _ f ->
            { value = VFloat f, venv = venv, senv = senv, henv = henv, count = count }
        ETrue _ ->
            { value = VTrue, venv = venv, senv = senv, henv = henv, count = count }
        EFalse _ ->
            { value = VFalse, venv = venv, senv = senv, henv = henv, count = count }
        EChar _ c ->
            { value = VChar c, venv = venv, senv = senv, henv = henv, count = count }
        ECons (_, id) e1 e2 ->
            let
                res1 = eval e1 venv senv henv count
                res2 = eval e2 venv res1.senv henv res1.count
            in
            case res2.value of
                VHole _ _ -> 
                    let 
                        c = 
                            findCount tempHoleCount count 
                    in
                        { value = VHole (HInter (c+1)) venv, venv = venv, senv = senv, henv = henv, count = (tempHoleCount, c+1)::count}
                _ ->
                    if id == esQuo || id == esElm then
                        { value = VCons vsId res1.value res2.value, venv = venv, senv = senv, henv = henv, count = count }
                    else
                        { value = VCons voId res1.value res2.value, venv = venv, senv = senv, henv = henv, count = count }
        ENil (_, id) ->
            if id == 3 || id == 4 then
                { value = VNil 1, venv = venv, senv = senv, henv = henv, count = count }
            else
                { value = VNil 0, venv = venv, senv = senv, henv = henv, count = count }
        EHole _ hn ->
            defaultEvalRes
        EBPrim _ bop e1 e2 ->
            defaultEvalRes
        EUPrim _ uop e ->
            defaultEvalRes
        ECase _ e branches ->
            defaultEvalRes
        EFix _ e ->
            defaultEvalRes
        EBTuple _ e1 e2 ->
            defaultEvalRes
        ETTuple _ e1 e2 e3 ->
            defaultEvalRes
        EPrint _ e ->
            defaultEvalRes
        ERead _ ->
            defaultEvalRes
        EError info ->
            defaultEvalRes
        

findCount : HoleName -> List (HoleName, Int) -> Int
findCount hn count =
    case count of
        (HInter 0, n)::_ -> n
        (hn_, n)::ct ->
            if hn == hn_
            then n
            else findCount hn ct
        [] -> 0