module IMP.Utils exposing (..)

import IMP.Syntax exposing (..)
import Dict exposing (Dict)
type alias HoleMap = Dict String Expr

lookup : String -> Store -> Maybe Value
lookup x store =
    case store of
        (x_, v) :: rest -> if x == x_ then Just v else lookup x rest
        [] -> Nothing

lookupHB : HoleName -> Store -> HoleBindings -> Maybe Value
lookupHB h store holeBindings =
    case holeBindings of
        (h_, store_, v) :: rest -> 
            if h == h_ && (isSameStore store store_ )then Just v
            else lookupHB h store rest
        [] -> Nothing

isSameStore : Store -> Store -> Bool
isSameStore store1 store2 =
    case (store1, store2) of
        ((x1, v1) :: rest1, (x2, v2) :: rest2) -> 
            if x1 == x2 && v1 == v2 then isSameStore rest1 rest2 else False
        ([], []) -> True
        _ -> False

updateStore : String -> Value -> Store -> Store
updateStore x v store =
    if x == "input" || x == "output" then store else 
    case store of
        (x_, v_) :: rest -> if x == x_ then (x, v) :: rest else (x_, v_) :: updateStore x v rest
        [] -> (x, v) :: store

getIO : IO -> String -> List Value
getIO io n =
    case io of 
        (n_, v) :: rest -> if n == n_ then v else getIO rest n
        [] -> []

updateIO : IO -> String -> List Value -> IO
updateIO io n vs =
    case io of 
        (n_, vs_) :: rest -> if n == n_ then (n, vs) :: rest else (n_, vs_) :: updateIO rest n vs
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

polluteState : List String -> Store -> IO -> HCount -> (Int -> Value) -> (Store, IO)
polluteState mod store io hcount createHole =
    case mod of
        [] -> (store, io)
        x :: rest ->
            if x == "input" then 
                let io_ = updateIO io x [createHole hcount] in
                polluteState rest store io_ (hcount+1) createHole
            else if x == "output" then
                let io_ = updateIO io x ((getIO io x)++[createHole hcount]) in
                polluteState rest store io_ (hcount+1) createHole
            else
                let store_ = updateStore x (createHole hcount) store in
                polluteState rest store_ io (hcount+1) createHole

substHole : HoleMap -> RiStmts -> RiStmts
substHole holes ris =
    case ris of
        [] -> []
        (id, s, (store, io)) :: rest ->
            let
                news = substHoleinStmt s holes
            in
            (id, news, (store, io)) :: (substHole holes rest)

substHoleinStmt : Stmt -> HoleMap -> Stmt
substHoleinStmt s holes =
    case s of
        SIf ws e s1 s2 -> SIf ws (substHoleinExpr e holes) (substHoleinStmt s1 holes) (substHoleinStmt s2 holes)
        SWhile ws e s_ -> SWhile ws (substHoleinExpr e holes) (substHoleinStmt s_ holes)
        SAssign ws x e -> SAssign ws x (substHoleinExpr e holes)
        SRead ws x -> SRead ws x
        SPrint ws e -> SPrint ws (substHoleinExpr e holes)
        SSeq ws s1 s2 -> SSeq ws (substHoleinStmt s1 holes) (substHoleinStmt s2 holes)
        SSkip ws -> SSkip ws

substHoleinExpr : Expr -> HoleMap -> Expr
substHoleinExpr e holes =
    case e of
        EVar ws x -> EVar ws x
        Eop ws op e1 e2 -> Eop ws op (substHoleinExpr e1 holes) (substHoleinExpr e2 holes)
        EInt ws i -> EInt ws i
        EHole ws h_ -> 
            let expr = Dict.get (holeKey h_) holes in
            case expr of
                Just expr_ -> expr_
                Nothing -> EHole ws h_
        EBool ws b -> EBool ws b
        EString ws s -> EString ws s
        EError s -> EError s
        

holeKey : HoleName -> String
holeKey h =
    case h of
        HOri n -> "o:" ++ String.fromInt n
        HVar n -> "v:" ++ String.fromInt n
        HTmp -> "t"

value2Expr : Value -> Expr
value2Expr v =
    case v of
        VInt i -> EInt [] i
        VBool b -> EBool [] b
        VString s -> EString [] s
        VHole h _ -> EHole [] h
        VError _ -> EError "Unsupported expression"

expr2Val : Expr -> Value
expr2Val e =
    case e of
        EInt _ i -> VInt i
        EBool _ b -> VBool b
        EString _ s -> VString s
        _ -> VError "Unsupported expression"

delStore : String -> Store -> Store
delStore x store =
    case store of
        (x_, v) :: rest -> if x == x_ then rest else (x_, v) :: delStore x rest
        [] -> []