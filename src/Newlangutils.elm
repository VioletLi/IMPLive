module Newlangutils exposing (..)

import Syntax exposing (..)

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