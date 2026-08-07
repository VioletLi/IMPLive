module IMP.Utils exposing (..)

import IMP.Syntax exposing (..)

lookup : String -> Store -> Maybe (RExpr, StmtID)
lookup x store =
    case store of
        (x_, e, id) :: rest -> if x == x_ then Just (e, id) else lookup x rest
        [] -> Nothing

lookupHB : HoleName -> Store -> HoleBindings -> Maybe Expr
lookupHB h store holeBindings =
    case holeBindings of
        (h_, store_, e) :: rest -> 
            if h == h_ && (isSameStore store store_ )then Just e 
            else lookupHB h store rest
        [] -> Nothing

isSameStore : Store -> Store -> Bool
isSameStore store1 store2 =
    case (store1, store2) of
        ((x1, e1, id1) :: rest1, (x2, e2, id2) :: rest2) -> 
            if x1 == x2 && e1 == e2 && id1 == id2 then isSameStore rest1 rest2 else False
        ([], []) -> True
        _ -> False

updateStore : String -> RExpr -> StmtID -> Store -> Store
updateStore x se id store =
    if x == "input" || x == "output" then store else 
    case store of
        (x_, e, id_) :: rest -> if x == x_ then (x, se, id) :: rest else (x_, e, id_) :: updateStore x se id rest
        [] -> (x, se, id) :: store

getIO : IO -> String -> (List RExpr, StmtID)
getIO io n =
    case io of 
        (n_, es, id) :: rest -> if n == n_ then (es, id) else getIO rest n
        [] -> ([], -2)

updateIO : IO -> String -> List RExpr -> StmtID -> IO
updateIO io n es id =
    case io of 
        (n_, e, id_) :: rest -> if n == n_ then (n, es, id) :: rest else (n_, e, id_) :: updateIO rest n es id
        [] -> []

modVars : Stmt -> List String
modVars s =
    case s of
        SAssign _ x _ -> [x]
        SIf _ _ s1 s2 -> modVars s1 ++ modVars s2
        SWhile _ _ s_ -> modVars s_
        SRead _ x -> [x, "input"]
        SPrint _ _ -> ["output"]
        SSeq _ s1 s2 -> modVars s1 ++ modVars s2
        _ -> []

unique : List a -> List a
unique ls =
    case ls of
        [] -> []
        x :: rest ->
            if List.member x rest then unique rest
            else x :: (unique rest)

polluteStore : List String -> Store -> IO -> Int -> Int -> (Int -> RExpr) -> (Store, IO, Int)
polluteStore mod store io hcount scount createHole =
    case mod of
        [] -> (store, io, hcount)
        x :: rest ->
            if (x == "input") || (x == "output") then
                let (ori, _) = getIO io x in
                let io_ = updateIO io x ori scount in
                polluteStore rest store io_ (hcount+1) scount createHole
            else
                let store_ = updateStore x (createHole hcount) scount store in
                polluteStore rest store_ io (hcount+1) scount createHole

embedStmt : Stmt -> RStmt
embedStmt s =
    case s of
        SAssign _ x e -> RSAssign x (REExpr e)
        SIf _ e s1 s2 -> RSIf (REExpr e) (embedStmt s1) (embedStmt s2)
        SWhile _ e s_ -> RSWhile (REExpr e) (embedStmt s_)
        SRead _ x -> RSRead x
        SPrint _ e -> RSPrint (REExpr e)
        SSeq _ s1 s2 -> RSSeq (embedStmt s1) (embedStmt s2)
        _ -> RSSkip