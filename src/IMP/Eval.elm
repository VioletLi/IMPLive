module IMP.Eval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Utils exposing (..)
import Dict exposing (Dict)


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

elaborate : Store -> HoleBindings -> Expr -> (Expr, State)
elaborate store holeBindings expr =
    case expr of
        EVar _ x -> 
            case lookup x store of
                Just (e, id) -> 
                    if id == -1 then (e, TOP) else (e, BOT)
                Nothing -> (EError "Variable not found", BOT)
        EInt ws i -> (EInt ws i, TOP)
        EBool ws b -> (EBool ws b, TOP)
        EString ws s -> (EString ws s, TOP)
        EHole ws h -> 
            case lookupHB h store holeBindings of
                Just e -> (e, TOP)
                Nothing -> (EHole ws h, BOT)
        Eop ws op e1 e2 -> 
            let 
                (e1_, st1) = elaborate store holeBindings e1
                (e2_, st2) = elaborate store holeBindings e2
            in 
            if st1 == TOP && st2 == TOP then (bop op e1_ e2_, TOP) else (Eop ws op e1_ e2_, BOT)
        EError s -> (EError s, BOT)

bop : String -> Expr -> Expr -> Expr
bop op e1 e2 =
    case op of
        "+" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EInt [] (i1 + i2)
                _ -> EError "Unsupported operation"
        "-" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EInt [] (i1 - i2)
                _ -> EError "Unsupported operation"
        "*" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EInt [] (i1 * i2)
                _ -> EError "Unsupported operation"
        "/" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EInt [] (i1 // i2)
                _ -> EError "Unsupported operation"
        "==" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 == i2)
                (EBool _ b1, EBool _ b2) -> EBool [] (b1 == b2)
                (EString _ s1, EString _ s2) -> EBool [] (s1 == s2)
                _ -> EError "Unsupported operation"
        "!=" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 /= i2)
                (EBool _ b1, EBool _ b2) -> EBool [] (b1 /= b2)
                (EString _ s1, EString _ s2) -> EBool [] (s1 /= s2)
                _ -> EError "Unsupported operation"
        "<" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 < i2)
                _ -> EError "Unsupported operation"
        ">" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 > i2)
                _ -> EError "Unsupported operation"
        "<=" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 <= i2)
                _ -> EError "Unsupported operation"
        ">=" -> 
            case (e1, e2) of
                (EInt _ i1, EInt _ i2) -> EBool [] (i1 >= i2)
                _ -> EError "Unsupported operation"
        "++" -> 
            case (e1, e2) of
                (EString _ s1, EString _ s2) -> EString [] (s1 ++ s2)
                _ -> EError "Unsupported operation"
        _ -> EError "Unsupported operation"

exec : Store -> IO -> HoleBindings -> RiStmts -> Stmt -> Int -> Int -> FwdRes
exec store io holeBindings riStmts stmt hcount scount =
    case stmt of
        SSkip _ -> {store = store, io = io, riStmts = riStmts, hcount = hcount, scount = scount}
        SAssign _ x e ->
            let
                (e_, st) = elaborate store holeBindings e
                (id, se, rstmt) = if st == TOP then (-1, e_, []) else (scount, EHole [] (HVar hcount), [(scount, SAssign [] x e_, (store, io))])
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
                    EBool _ True -> exec store io holeBindings riStmts s1 hcount scount
                    EBool _ False -> exec store io holeBindings riStmts s2 hcount scount
                    _ -> {defaultFwdRes|store=[("error", EError "Unsupported guard of If", -2)]}
            else
                let
                    -- if和read这些对input和output的变量好像有冲突？
                    mod = unique (modVars s1 ++ (modVars s2))
                    (store_, io_, hcount_) = polluteStore mod store io hcount scount (\id -> EHole [] (HVar id))
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, SIf [] e_ s1 s2, (store, io))]
                , hcount = hcount_
                , scount = scount + 1
                }
        SWhile _ e s -> 
            let
                (e_, st) = elaborate store holeBindings e
            in
            if st == TOP then 
                case e_ of
                    EBool _ True -> exec store io holeBindings riStmts (SSeq [] s stmt) hcount scount
                    EBool _ False -> 
                        { store = store
                        , io = io
                        , riStmts = riStmts
                        , hcount = hcount
                        , scount = scount}
                    _ -> {defaultFwdRes | store = [("error", EError "Unsupported guard of While", -2)]}
            else
                let 
                    mod = unique (modVars s) 
                    (store_, io_, hcount_) = polluteStore mod store io hcount scount (\id -> EHole [] (HVar id))
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, stmt, (store, io))]
                , hcount = hcount_
                , scount = scount + 1
                }
        SRead _ x ->
            let
                (es, id) = getIO io "input"
            in
            if id == -2 then 
                {defaultFwdRes | store = [("error", EError "Input not found", -2)]} 
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
                    _ -> {defaultFwdRes | store = [("error", EError "Input Stream Empty", -2)]} 
            else
                { store = updateStore x (EHole [] (HVar hcount)) scount store
                , io = updateIO io "input" es scount
                , riStmts = riStmts ++ [(scount, SRead [] x, (store, io))]
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
                , io = updateIO io "output" (es ++ [EHole [] (HVar hcount)]) scount
                , riStmts = riStmts ++ [(scount, SPrint [] e_, (store, io))]
                , hcount = hcount + 1
                , scount = scount + 1
                }

-- fill : HoleName -> Expr -> HoleBindings -> FwdRes -> (List (Int, Store, IO), FwdRes)
fill holes hb fwdRes =
    let
        newris = substHole holes fwdRes.riStmts
        (execList, newris_) = tryExec hb newris fwdRes.hcount fwdRes.scount
    in
        if List.isEmpty execList then {fwdRes | riStmts = newris_}
        else
            let (store_, h2eMap) = substHoleInStore fwdRes.store execList Dict.empty in
            let (newris__, h2eMap_) = substHoleInStmtStore newris_ execList h2eMap in
            fill h2eMap_ hb {fwdRes | store = store_, riStmts = newris__}
        -- let (io_, iomap) = substHoleInIO fwdRes.io execList Dict.empty in

substHoleInStmtStore : RiStmts -> List (Int, Store, IO) -> HoleMap -> (RiStmts, HoleMap)
substHoleInStmtStore ris execList h2eMap =
    case ris of
        [] -> ([], h2eMap)
        (id, s, (store, io)) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore store execList h2eMap in
            let (resstmt, newh2eMap_) = substHoleInStmtStore rest execList newh2eMap in
            ((id, s, (newstore, io))::resstmt, newh2eMap_)

tryExec : HoleBindings -> RiStmts -> Int -> Int -> (List (Int, Store, IO), RiStmts)
tryExec hb ris hcount scount =
    case ris of
        [] -> ([], [])
        (id, s, (store, io)) :: rest ->
            case s of
                SAssign ws x e ->
                    let (e_, st) = elaborate store hb e in 
                    if st == TOP then 
                        let res = exec store io hb [] (SAssign ws x e_) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id, SAssign ws x e_, (store, io))::stmt_)
                SIf ws e s1 s2 -> 
                    let (e_, st) = elaborate store hb e in 
                    if st == TOP then 
                        let res = exec store io hb [] (SIf ws e_ s1 s2) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id, SIf ws e_ s1 s2, (store, io))::stmt_)
                SWhile ws e s_ -> 
                    let (e_, st) = elaborate store hb e in 
                    if st == TOP then 
                        let res = exec store io hb [] (SWhile ws e_ s_) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id, SWhile ws e_ s_, (store, io))::stmt_)
                SRead _ x -> 
                    let (es, id_) = getIO io "input" in
                    if id_ == -1 then 
                        let res = exec store io hb [] (SRead [] x) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id_, SRead [] x, (store, io))::stmt_)
                SPrint ws e -> 
                    let (e_, st) = elaborate store hb e in 
                    if st == TOP then 
                        let res = exec store io hb [] (SPrint ws e_) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id, SPrint ws e_, (store, io))::stmt_)
                _ -> ([(-2, [], [])], [])
-- 如果能运行就把语句直接从residual删掉，记录被删掉的id，io/store,不然就更新，被删掉的id需要对应着去找到剩余的所有残余语句中的store，更新store的值

substHoleInStore : Store -> List (Int, Store, IO) -> HoleMap -> (Store, HoleMap)
substHoleInStore store execList h2eMap =
    case store of
        [] -> ([], h2eMap)
        (x, EHole ws h, id) :: rest ->
            if List.any (\(id_, _, _) -> id_ == id) execList then
                let store_ = findStore id execList in
                let val = lookup x store_ in
                case val of
                    Just (e, vid) ->
                        let nd = if vid == -1 then Dict.insert (holeKey h) e h2eMap else h2eMap in
                        let (newstore, newh2eMap) = substHoleInStore rest execList nd in
                        ((x, e, vid)::newstore, newh2eMap)
                    Nothing -> ([], h2eMap)
            else
                let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
                ((x, EHole ws h, id)::newstore, newh2eMap)
        (x, e, id) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
            ((x, e, id)::newstore, newh2eMap)

findStore : Int -> List (Int, Store, IO) -> Store
findStore id execList =
    case execList of
        [] -> []
        (id_, store_, _) :: rest ->
            if id_ == id then
                store_
            else
                findStore id rest

substHoleInIO : IO -> List (Int, Store, IO) -> IOMap -> (IO, IOMap)
substHoleInIO io execList ioMap = (io, ioMap)
    -- let
    --     (ei, iID) = getIO io "input"
    --     (eo, oID) = getIO io "output"
    --     (ei_, iID_, newh2eMap) = if iID == -1 then (ei, iID, h2eMap) else 
    --         if (List.any (\(id_, _, _) -> id_ == iID) execList) then 
    --             let 
    --                 (ei__, iID__) = getIO (findIO iID execList) "input" 
    --             in
    --             case ei of
    --                 EHole ws h ->
    --                     (ei__, iID__, Dict.insert (holeKey h) (ei__, iID__) h2eMap)
    --                 _ -> ([EError "Unsupported input"], -2, h2eMap)
    --         else (ei, iID, h2eMap)

    -- in
    -- ([("input", ei_, iID_)], newh2eMap)

-- findIO : Int -> List (Int, Store, IO) -> IO
-- findIO id execList =
--     case execList of
--         [] -> []
--         (id_, store_, io_) :: rest ->
--             if id_ == id then
--                 io_
--             else
--                 findIO id rest