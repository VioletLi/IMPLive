module IMP.Eval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Utils exposing (..)

type alias FwdRes = 
    {
        store : Store,
        io : IO,
        riStmts : RiStmts,
        hcount : Int,
        scount : Int
    }

defaultFwdRes : FwdRes
defaultFwdRes = {store = [], io = [], riStmts = [], hcount = 0, scount = 0}

elaborate : Store -> HoleBindings -> Expr -> (RExpr, State)
elaborate store holeBindings expr =
    case expr of
        EVar _ x -> 
            case lookup x store of
                Just (e, id) -> 
                    if id == -1 then (e, TOP) else (e, BOT)
                Nothing -> (Error "Variable not found", BOT)
        EInt _ i -> (REExpr (EInt [] i), TOP)
        EBool _ b -> (REExpr (EBool [] b), TOP)
        EString ws s -> (REExpr (EString ws s), TOP)
        EHole _ h -> 
            case lookupHB h store holeBindings of
                Just e -> (REExpr e, TOP)
                Nothing -> (REHole h store, BOT)
        Eop _ op e1 e2 -> 
            let 
                (e1_, st1) = elaborate store holeBindings e1
                (e2_, st2) = elaborate store holeBindings e2
            in 
            if st1 == TOP && st2 == TOP then (bop op e1_ e2_, TOP) else (REOp op e1_ e2_, BOT)


bop : String -> RExpr -> RExpr -> RExpr
bop op e1 e2 =
    case op of
        "+" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EInt [] (i1 + i2))
                _ -> Error "Unsupported operation"
        "-" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EInt [] (i1 - i2))
                _ -> Error "Unsupported operation"
        "*" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EInt [] (i1 * i2))
                _ -> Error "Unsupported operation"
        "/" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EInt [] (i1 // i2))
                _ -> Error "Unsupported operation"
        "==" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 == i2))
                (REExpr (EBool _ b1), REExpr (EBool _ b2)) -> REExpr (EBool [] (b1 == b2))
                (REExpr (EString _ s1), REExpr (EString _ s2)) -> REExpr (EBool [] (s1 == s2))
                _ -> Error "Unsupported operation"
        "!=" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 == i2))
                (REExpr (EBool _ b1), REExpr (EBool _ b2)) -> REExpr (EBool [] (b1 == b2))
                (REExpr (EString _ s1), REExpr (EString _ s2)) -> REExpr (EBool [] (s1 == s2))
                _ -> Error "Unsupported operation"
        "<" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 < i2))
                _ -> Error "Unsupported operation"
        ">" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 > i2))
                _ -> Error "Unsupported operation"
        "<=" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 <= i2))
                _ -> Error "Unsupported operation"
        ">=" -> 
            case (e1, e2) of
                (REExpr (EInt _ i1), REExpr (EInt _ i2)) -> REExpr (EBool [] (i1 >= i2))
                _ -> Error "Unsupported operation"
        "++" -> 
            case (e1, e2) of
                (REExpr (EString _ s1), REExpr (EString _ s2)) -> REExpr (EString [] (s1 ++ s2))
                _ -> Error "Unsupported operation"
        _ -> Error "Unsupported operation"

exec : Store -> IO -> HoleBindings -> RiStmts -> Stmt -> Int -> Int -> FwdRes
exec store io holeBindings riStmts stmt hcount scount =
    case stmt of
        SSkip _ -> {store = store, io = io, riStmts = riStmts, hcount = hcount, scount = scount}
        SAssign _ x e ->
            let
                (e_, st) = elaborate store holeBindings e
                (id, se, rstmt) = if st == TOP then (-1, e_, []) else (scount, REHole hcount store, [(scount, RSAssign x e_, store)])
            in
            { store = updateStore x se id store
            , io = io
            , riStmts = riStmts ++ rstmt
            , hcount = if id == -1 then hcount else hcount+1
            , scount = if id == -1 then scount else scount+1}
        SSeq _ s1 s2 -> 
            let
                res1 = exec store io holeBindings riStmts s1 hcount scount
                res2 = exec res1.store res1.io holeBindings res1.riStmts s2 res1.hcount res1.scount
            in
            res2
        SIf _ e s1 s2 -> 
            let
                (e_, st) = elaborate store holeBindings e
            in
            if st == TOP then 
                case e_ of
                    REExpr (EBool _ True) -> exec store io holeBindings riStmts s1 hcount scount
                    REExpr (EBool _ False) -> exec store io holeBindings riStmts s2 hcount scount
                    _ -> {defaultFwdRes|store=[("error", Error "Unsupported guard of If", -2)]}
            else
                let
                    -- if和read这些对input和output的变量好像有冲突？
                    mod = unique (modVars s1 ++ (modVars s2))
                    (store_, io_, hcount_) = polluteStore mod store io hcount scount (\id -> REHole id store)
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, RSIf e_ (embedStmt s1) (embedStmt s2), store)]
                , hcount = hcount_
                , scount = scount + 1
                }
        SWhile _ e s -> 
            let
                (e_, st) = elaborate store holeBindings e
            in
            if st == TOP then 
                case e_ of
                    REExpr (EBool _ True) -> exec store io holeBindings riStmts (SSeq [] s stmt) hcount scount
                    REExpr (EBool _ False) -> 
                        { store = store
                        , io = io
                        , riStmts = riStmts
                        , hcount = hcount
                        , scount = scount}
                    _ -> {defaultFwdRes | store = [("error", Error "Unsupported guard of While", -2)]}
            else
                let 
                    mod = unique (modVars s) 
                    (store_, io_, hcount_) = polluteStore mod store io hcount scount (\id -> REHole id store)
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, embedStmt stmt, store)]
                , hcount = hcount_
                , scount = scount + 1
                }
        SRead _ x ->
            let
                (es, id) = getIO io "input"
            in
            if id == -2 then 
                {defaultFwdRes | store = [("error", Error "Input not found", -2)]} 
            else 
            if id == -1 then 
                let
                    (e_, rest) = (List.head es, List.tail es)
                in
                case (e_, rest) of
                    (Just e__, Just rest_) -> 
                        let io_ = updateIO io "input" rest_ -1 in
                        { store = updateStore x e__ -1 store
                        , io = io_
                        , riStmts = riStmts
                        , hcount = hcount
                        , scount = scount}
                    _ -> {defaultFwdRes | store = [("error", Error "Input Stream Empty", -2)]} 
            else
                { store = updateStore x (REHole hcount store) scount store
                , io = updateIO io "input" es scount
                , riStmts = riStmts ++ [(scount, RSRead x, store)]
                , hcount = hcount + 1
                , scount = scount + 1
                }
        SPrint _ e -> 
            let
                (e_, st) = elaborate store holeBindings e
                (es, id) = getIO io "output"
            in
            if st == TOP then 
                { store = store
                , io = updateIO io "output" (es ++ [e_]) id
                , riStmts = riStmts
                , hcount = hcount
                , scount = scount
                }
                -- 这里不确定到底update到statement id是多少，看fill的实现决定
            else 
                { store = store
                , io = updateIO io "output" (es ++ [REHole hcount store]) scount
                , riStmts = riStmts ++ [(scount, RSPrint e_, store)]
                , hcount = hcount + 1
                , scount = scount + 1
                }