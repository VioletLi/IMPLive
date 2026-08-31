module IMP.Utils exposing (..)

import IMP.Syntax exposing (..)
import Dict exposing (Dict)
type alias HoleMap = Dict String Expr

preprocessStmt : Stmt -> HCount -> (Stmt, HCount)
preprocessStmt s hcount =
    case s of
        SIf ws e s1 s2 -> 
            let (e_, hcount_) = preprocessExpr e hcount in
            let (s1_, hcount__) = preprocessStmt s1 hcount_ in
            let (s2_, hcount___) = preprocessStmt s2 hcount__ in
            (SIf ws e_ s1_ s2_, hcount___)
        SWhile ws e s_ -> 
            let (e_, hcount_) = preprocessExpr e hcount in
            let (s__, hcount__) = preprocessStmt s_ hcount_ in
            (SWhile ws e_ s__, hcount_)
        SAssign ws x e -> 
            let (e_, hcount_) = preprocessExpr e hcount in
            (SAssign ws x e_, hcount_)
        SRead ws x -> 
            (SRead ws x, hcount)
        SPrint ws e -> 
            let (e_, hcount_) = preprocessExpr e hcount in
            (SPrint ws e_, hcount_)
        SSeq ws s1 s2 -> 
            let (s1_, hcount_) = preprocessStmt s1 hcount in
            let (s2_, hcount__) = preprocessStmt s2 hcount_ in
            (SSeq ws s1_ s2_, hcount__)
        SSkip ws -> 
            (SSkip ws, hcount)
        SError info -> 
            (SError info, hcount)

preprocessExpr : Expr -> HCount -> (Expr, HCount)
preprocessExpr e hcount =
    case e of
        EVar ws x -> (EVar ws x, hcount)
        Eop ws op e1 e2 -> 
            let (e1_, hcount_) = preprocessExpr e1 hcount in
            let (e2_, hcount__) = preprocessExpr e2 hcount_ in
            (Eop ws op e1_ e2_, hcount__)
        EInt ws i -> (EInt ws i, hcount)
        EBool ws b -> (EBool ws b, hcount)
        EString ws s -> (EString ws s, hcount)
        EError info -> (EError info, hcount)
        ENot ws e_ -> 
            let (e__, hcount_) = preprocessExpr e_ hcount in
            (ENot ws e__, hcount_)
        EParens ws e_ -> 
            let (e__, hcount_) = preprocessExpr e_ hcount in
            (EParens ws e__, hcount_)
        EHole ws _ -> 
            (EHole ws (HOri hcount), hcount+1)
        EList ws es -> 
            let (es_, hcount_) = preprocessList es hcount in
            (EList ws es_, hcount_)
        EIndex ws e1 e2 -> 
            let
                (e1_, hcount_) = preprocessExpr e1 hcount
                (e2_, hcount__) = preprocessExpr e2 hcount_
            in
            (EIndex ws e1_ e2_, hcount__)

preprocessList : List Expr -> HCount -> (List Expr, HCount)
preprocessList es hcount =
    case es of
        [] -> ([], hcount)
        e :: rest ->
            let (e_, hcount_) = preprocessExpr e hcount in
            let (rest_, hcount__) = preprocessList rest hcount_ in
            (e_ :: rest_, hcount__)

lookup : String -> Store -> Maybe Value
lookup x store =
    case store of
        (x_, v) :: rest -> if x == x_ then Just v else lookup x rest
        [] -> Nothing

lookupHB : HoleName -> Store -> IO -> HoleBindings -> Maybe Value
lookupHB h store io holeBindings =
    case holeBindings of
        (h_, (store_, io_), v) :: rest -> 
            if h == h_ && (isSameStore store store_ ) && (isSameIO io io_) then Just v
            else lookupHB h store io rest
        [] -> Nothing

isSameStore : Store -> Store -> Bool
isSameStore store1 store2 =
    case (store1, store2) of
        ((x1, v1) :: rest1, (x2, v2) :: rest2) -> 
            if x1 == x2 && v1 == v2 then isSameStore rest1 rest2 else False
        ([], []) -> True
        _ -> False

isSameIO : IO -> IO -> Bool
isSameIO io1 io2 =
    case (io1, io2) of
        ((n1, vs1) :: rest1, (n2, vs2) :: rest2) -> 
            if n1 == n2 && vs1 == vs2 then isSameIO rest1 rest2 else False
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

polluteState : List String -> Store -> IO -> SCount -> (Store, IO)
polluteState mod store io scount =
    case mod of
        [] -> (store, io)
        x :: rest ->
            if x == "input" then 
                let io_ = updateIO io x [VHole (HVar x) scount] in
                polluteState rest store io_ scount
            else if x == "output" then
                let io_ = updateIO io x ((getIO io x)++[VHole (HVar x) scount]) in
                polluteState rest store io_ scount
            else
                let store_ = updateStore x (VHole (HVar x) scount) store in
                polluteState rest store_ io scount

substHole : HoleMap -> RiStmts -> RiStmts
substHole holes ris =
    case ris of
        [] -> []
        (id, s, (store, io)) :: rest ->
            let
                news = substHoleinStmt id s holes
            in
            (id, news, (store, io)) :: (substHole holes rest)

substHoleinStmt : StmtID -> Stmt -> HoleMap -> Stmt
substHoleinStmt id s holes =
    case s of
        SIf ws e s1 s2 -> SIf ws (substHoleinExpr id e holes) (substHoleinStmt id s1 holes) (substHoleinStmt id s2 holes)
        SWhile ws e s_ -> SWhile ws (substHoleinExpr id e holes) (substHoleinStmt id s_ holes)
        SAssign ws x e -> SAssign ws x (substHoleinExpr id e holes)
        SRead ws x -> SRead ws x
        SPrint ws e -> SPrint ws (substHoleinExpr id e holes)
        SSeq ws s1 s2 -> SSeq ws (substHoleinStmt id s1 holes) (substHoleinStmt id s2 holes)
        SSkip ws -> SSkip ws
        SError info -> SError info

substHoleinExpr : StmtID -> Expr -> HoleMap -> Expr
substHoleinExpr id e holes =
    case e of
        EVar ws x -> EVar ws x
        Eop ws op e1 e2 -> Eop ws op (substHoleinExpr id e1 holes) (substHoleinExpr id e2 holes)
        EInt ws i -> EInt ws i
        EHole ws h_ -> 
            let expr = Dict.get (holeKey h_ id) holes in
            case expr of
                Just expr_ -> expr_
                Nothing -> EHole ws h_
        EBool ws b -> EBool ws b
        EString ws s -> EString ws s
        EError s -> EError s
        ENot ws e_ -> ENot ws (substHoleinExpr id e_ holes)
        EParens ws e_ -> EParens ws (substHoleinExpr id e_ holes)
        EList ws es -> EList ws (List.map (\e_ -> substHoleinExpr id e holes) es)
        EIndex ws e1 e2 -> EIndex ws (substHoleinExpr id e1 holes) (substHoleinExpr id e2 holes)

holeKey : HoleName -> StmtID -> String
holeKey h id =
    case h of
        HOri n -> "o:" ++ (String.fromInt n)
        HVar x -> "v:" ++ x ++ "-" ++ (String.fromInt id)
        HTmp -> "t"

value2Expr : Value -> Expr
value2Expr v =
    case v of
        VInt i -> EInt [] i
        VBool b -> EBool [] b
        VString s -> EString [] s
        VHole h _ -> EHole [] h
        VList vs -> EList [] (List.map value2Expr vs)
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

nthValue : List Value -> Int -> Value
nthValue vs i =
    if i < 0 then VError "Index out of range" else
        case vs of
            v :: rest -> if i == 0 then v else nthValue rest (i - 1)
            [] -> VError "Index out of range"
