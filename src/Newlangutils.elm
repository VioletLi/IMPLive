module Newlangutils exposing (..)

import Syntax exposing (..)
import Debug exposing (toString)

findVarByName : String -> VEnv -> Maybe Loc
findVarByName x venv =
    case venv of
        [] -> Nothing

        (x1, l1) :: ls ->
            if x1 == x then
                Just l1
            else
                findVarByName x ls

findValByLoc : Loc -> SEnv -> Value
findValByLoc l senv =
    case senv of
        [] -> VError "Value not found in store"

        v1 :: vs ->
            if l == 0 then
                v1
            else
                findValByLoc (l - 1) vs

match : Pattern -> Value -> List (String, Value)
match pat val =
    case (pat, val) of
        (_, VError info) -> [("ERROR", VError info)]
        ((PCons _ p1 p2), (VHole u env)) ->
            let 
                res1 = 
                    match p1 (VHole (HField u (HId 1)) env)
                
                res2 =
                    match p2 (VHole (HField u (HId 2)) env)
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2

        ((PBTuple _ p1 p2), (VHole u env)) ->
            let 
                res1 = 
                    match p1 (VHole (HField u (HId 1)) env)
                
                res2 =
                    match p2 (VHole (HField u (HId 2)) env)
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2

        ((PTTuple _ p1 p2 p3), (VHole u env)) ->
            let 
                res1 = 
                    match p1 (VHole (HField u (HId 1)) env)
                
                res2 =
                    match p2 (VHole (HField u (HId 2)) env)

                res3 =
                    match p3 (VHole (HField u (HId 3)) env)
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2++res3

        ((PCons _ p1 p2), (VCons _ v vs)) ->
            let
                res1 = 
                    match p1 v

                res2 =
                    match p2 vs
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2

        ((PBTuple _ p1 p2), (VBTuple v1 v2)) ->
            let
                res1 = 
                    match p1 v1

                res2 =
                    match p2 v2
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2
        
        ((PTTuple _ p1 p2 p3), (VTTuple v1 v2 v3)) ->
            let
                res1 = 
                    match p1 v1

                res2 =
                    match p2 v2

                res3 =
                    match p3 v3
            in
            if res1 == [("ERROR", VError "Match Failed.")] ||
                res2 == [("ERROR", VError "Match Failed.")] ||
                res3 == [("ERROR", VError "Match Failed.")]
            then 
                [("ERROR", VError "Match Failed.")]
            else
                res1++res2++res3

        ((PInt _ n1), (VInt n2)) ->
            if n1 == n2 then [] else [("ERROR", VError "Match Failed.")]
        ((PInt _ _), VHole _ _) -> []

        ((PFloat _ n1), (VFloat n2)) ->
            if n1 == n2 then [] else [("ERROR", VError "Match Failed.")]
        ((PFloat _ _), VHole _ _) -> []

        (PTrue _,  VTrue)     -> []
        (PTrue _, VHole _ _)  -> []
        (PFalse _, VFalse)    -> []
        (PFalse _, VHole _ _) -> []

        (PChar _ c1, VChar c2) ->
            if c1 == c2 then [] else [("ERROR", VError "Match Failed.")]
        (PChar _ _, VHole _ _) -> []
        
        (PNil _, VNil _)    -> []
        (PNil _, VHole _ _) -> []

        (PVar _ s, v) -> [(s, v)]

        _ -> [("ERROR", VError "Match Failed.")]

applyMatchResult : List (String, Value) -> VEnv -> SEnv -> (VEnv, SEnv)
applyMatchResult matchResult venv senv =
    case matchResult of
        [] -> (venv, senv)
        (s, v) :: ms ->
            let loc = findVarByName s venv in
            case loc of
                Just l ->
                    let senv_ = updStore l v senv in
                    applyMatchResult ms venv senv_
                Nothing ->
                    let l_ = length senv in
                    applyMatchResult ms ((s, l_)::venv) (senv++[v])

updStore : Loc -> Value -> SEnv -> SEnv
updStore l v senv =
    case senv of
        [] -> []
        v1 :: vs ->
            if l == 0 then
                v :: vs
            else
                v1 :: updStore (l - 1) v vs

length : List a -> Int
length ls =
    case ls of
        [] -> 0
        _ :: ls_ -> 1 + length ls_

append : Value -> Value -> Value
append l1 l2 =
    case l1 of
        VNil _ ->
            l2

        VCons id1 v1 vs1 ->
            VCons id1 v1 (append vs1 l2)

        _ ->
            VError "List Concat Error."

matchCase : Value -> Branch -> MatchCaseRes
matchCase v b =
    case b of
        BNSin _ n p e ->
            { venvm  = match p v
            , choice = n
            , ei = e
            , pi = p
            }

        BCom _ b1 b2 ->
            let 
                res = 
                    matchCase v b1 
            in
                case res.venvm of
                    [(_, VError _)] ->
                        matchCase v b2
                    
                    _ -> res
        
        _ ->
            { venvm  = []
            , choice = 0
            , ei = EError "Match Case Error."
            , pi = PNil defaultWS
            }

unique : List comparable -> List comparable
unique =
    List.foldr
        (\x acc ->
            if List.member x acc then
                acc
            else
                x :: acc
        )
        []

union : HEnv -> HEnv -> HEnv
union henv1 henv2 =
    case henv2 of
        (hn2, env2, v2)::henv2_ ->
            if elemIn hn2 env2 henv1 then
                union henv1 henv2_
            else
                (hn2, env2, v2)::(union henv1 henv2_)

        _ -> henv1

mergeHEnv3 : HEnv -> HEnv -> HEnv -> HEnv
mergeHEnv3 henv henv1 henv2 =
    case henv of
        (hn, env, v) :: henv_ ->
            let
                (v1, henv1_) =
                    getElem hn env henv1

                (v2, henv2_) =
                    getElem hn env henv2

                newE1 =
                    (hn, env, v1)

                newE2 =
                    (hn, env, v2)

                resMerge = 
                    mergeHEnv3 henv_ henv1_ henv2_
            in
            case v1 of
                VError _ ->
                    newE2 :: resMerge
                _ ->
                    if v1 /= v then
                        newE1 :: resMerge
                    else 
                        newE2 :: resMerge

        [] -> union henv1 henv2


mergeHEnv4 : HEnv -> HEnv -> HEnv -> HEnv -> HEnv
mergeHEnv4 henv henv1 henv2 henv3 =
    case henv of
        (hn, env, v) :: henv_ ->
            let
                (v1, henv1_) =
                    getElem hn env henv1

                (v2, henv2_) =
                    getElem hn env henv2

                (v3, henv3_) =
                    getElem hn env henv3

                newE1 =
                    (hn, env, v1)

                newE2 =
                    (hn, env, v2)

                newE3 =
                    (hn, env, v3)

                resMerge = 
                    mergeHEnv4 henv_ henv1_ henv2_ henv3_
            in
            case v1 of
                VError _ ->
                    newE2 :: resMerge
                _ ->
                    if v1 /= v then
                        newE1 :: resMerge
                    else if v2 /= v then
                        newE2 :: resMerge
                    else
                        newE3 :: resMerge

        [] -> union (union henv1 henv2) henv3

getElem : HoleName -> (VEnv, SEnv) -> HEnv -> (Value, HEnv)
getElem hn env henv =
    case henv of
        (hn1, env1, v1)::henv1 ->
            if hn == hn1 && isEqualEnv env env1 then
                (v1, henv1)
            else
                let
                    (resv, reshenv) =
                        getElem hn env henv1
                in
                (resv, (hn1, env1, v1)::reshenv)
        
        
        _ -> (VError "", [])

elemIn : HoleName -> (VEnv, SEnv) -> HEnv -> Bool
elemIn hn (venv, senv) henv =
    case henv of
        (hn1, (venv1, senv1), _)::henv_ ->
            if hn == hn1 && isEqualEnv (venv, senv) (venv1, senv1) then
                True
            else
                elemIn hn (venv, senv) henv_
        
        _ -> False

isEqualEnv : (VEnv, SEnv) -> (VEnv, SEnv) -> Bool
isEqualEnv (venv1, senv1) (venv2, senv2) =
    case (venv1, venv2) of
        ([], []) -> True
        ((x1, l1)::venv1_, (x2, l2)::venv2_) ->
            if x1 == x2 && l1 == l2 && getItem l1 senv1 == getItem l2 senv2 then
                let v1 = getItem l1 senv1
                    v2 = getItem l2 senv2
                in
                    case (v1, v2) of
                        (VError _, _) -> False
                        (_, VError _) -> False
                        _ -> if v1 == v2 then isEqualEnv (venv1_, senv1) (venv2_, senv2) else False
            else
                False
        _ -> False

getItem : Loc -> SEnv -> Value
getItem l senv =
    case senv of
        [] -> VError "Item not found in store"
        v :: vs -> if l == 0 then v else getItem (l - 1) vs

valueToExpr : Value -> HTotal -> (Expr, HTotal)
valueToExpr v htotal =
    case v of
        VNil id ->
            case id of
                0 ->
                    (ENil defaultWS, htotal)

                1 ->
                    (ENil defaultWS, htotal)
                
                _ ->
                    (EError "VNil Error", 0)
        VInt n ->
            (EInt defaultWS n, htotal)

        VFloat n ->
            (EFloat defaultWS n, htotal)

        VTrue ->
            (ETrue defaultWS, htotal)

        VFalse ->
            (EFalse defaultWS, htotal)

        VChar c ->
            (EChar defaultWS c, htotal)

        VCons _ v1 v2 ->
            let
                (e1, htotal1) =
                    valueToExpr v1 htotal

                (e2, htotal2) =
                    valueToExpr v2 htotal1
            in
                (ECons defaultWS e1 e2, htotal2)

        VBTuple v1 v2 ->
            let
                (e1, htotal1) =
                    valueToExpr v1 htotal

                (e2, htotal2) =
                    valueToExpr v2 htotal1
            in
                (EBTuple defaultWS e1 e2, htotal2)

        VTTuple v1 v2 v3 ->
            let
                (e1, htotal1) =
                    valueToExpr v1 htotal

                (e2, htotal2) =
                    valueToExpr v2 htotal1

                (e3, htotal3) =
                    valueToExpr v3 htotal2
            in
                (ETTuple defaultWS e1 e2 e3, htotal3)

        VHole _ _ ->
            (EHole defaultWS (HOri htotal), htotal+1)

        _ ->
            (EError ("Can Not Transfer Value: "++(toString v)++" To Expression.")
            , htotal)

changeWsForList : WS -> Expr -> Expr
changeWsForList ws expr =
    case expr of
        ENil _ ->
            ENil ws

        ECons _ e1 e2 ->
            ECons ws e1 e2

        _ ->
            EError "Impossible!"

deAppend : Value -> Int -> (Value, Value)
deAppend nl n1 =
    case (nl, n1) of
        (VCons nid _ _, 0) ->
            (VNil nid, nl)
        
        (VCons nid v1 vs, _) ->
            let
                (l1, l2) =
                    deAppend vs (n1 - 1)
            in
                (VCons nid v1 l1, l2)

        (VNil nid, _) ->
            (VNil nid, VNil nid)
        
        _ ->
            ( VError "New Value for Updating Concat Type Error"
            , VError "")

vlength : Value -> Int
vlength v =
    case v of
        VNil _ ->
            0

        VCons _ _ vs ->
            1 + (vlength vs)
        
        _ ->
            -1

insert : (HoleName, (VEnv, SEnv), Value) -> HEnv -> HEnv
insert (u, env, v) henv =
    case henv of
        [] -> [(u, env, v)]

        (u1, env1, v1)::hv ->
            if u1 == u && isEqualEnv env env1
            then (u1, env1, v)::hv
            else (u1, env1, v1)::(insert (u, env, v) hv)