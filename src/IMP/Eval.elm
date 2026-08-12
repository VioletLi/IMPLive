module IMP.Eval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Utils exposing (..)
import Dict exposing (Dict)


type alias FwdRes = 
    {
        store : Store,
        io : IO,
        riStmts : RiStmts,
        hcount : HCount,
        scount : SCount
    }

defaultFwdRes : FwdRes
defaultFwdRes = {store = [], io = [], riStmts = [], hcount = 0, scount = 0}

elaborate : Store -> HoleBindings -> Expr -> (Expr, State)
elaborate store holeBindings expr =
    case expr of
        EVar _ x -> 
            case lookup x store of
                Just (VHole h _) -> (EHole [] h, BOT)
                Just v -> (value2Expr v, TOP)
                Nothing -> (EError "Variable not found", BOT)
        EInt ws i -> (EInt ws i, TOP)
        EBool ws b -> (EBool ws b, TOP)
        EString ws s -> (EString ws s, TOP)
        EHole ws h -> 
            case lookupHB h store holeBindings of
                Just v -> (value2Expr v, TOP)
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

exec : Store -> IO -> HoleBindings -> RiStmts -> Stmt -> HCount -> SCount -> FwdRes
exec store io holeBindings riStmts stmt hcount scount =
    case stmt of
        SSkip _ -> {store = store, io = io, riStmts = riStmts, hcount = hcount, scount = scount}
        SAssign _ x e ->
            let
                (e_, st) = elaborate store holeBindings e
            in
            if st == TOP then 
                { store = updateStore x (expr2Val e_) store
                , io = io
                , riStmts = riStmts
                , hcount = hcount
                , scount = scount}
            else 
                { store = updateStore x (VHole (HVar hcount) scount) store
                , io = io
                , riStmts = riStmts ++ [(scount, SAssign [] x e_, (store, io))]
                , hcount = hcount+1
                , scount = scount+1}
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
                    _ -> {defaultFwdRes|store=[("error", VError "Unsupported guard of If")]}
            else
                let
                    -- if和read这些对input和output的变量好像有冲突？
                    mod = unique (modVars s1 ++ (modVars s2))
                    (store_, io_) = polluteState mod store io hcount (\id -> VHole (HVar id) scount)
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, SIf [] e_ s1 s2, (store, io))]
                , hcount = hcount + List.length mod
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
                    _ -> {defaultFwdRes | store = [("error", VError "Unsupported guard of While")]}
            else
                let 
                    mod = unique (modVars s) 
                    (store_, io_) = polluteState mod store io hcount (\id -> VHole (HVar id) scount)
                in
                { store = store_
                , io = io_
                , riStmts = riStmts ++ [(scount, stmt, (store, io))]
                , hcount = hcount + List.length mod
                , scount = scount + 1
                }
        SRead _ x ->
            let
                vs = getIO io "input"
            in
            case vs of
                [VHole _ _] -> 
                    { store = updateStore x (VHole (HVar hcount) scount) store
                    , io = updateIO io "input" [VHole (HVar (hcount+1)) scount]
                    , riStmts = riStmts ++ [(scount, SRead [] x, (store, io))]
                    , hcount = hcount+2
                    , scount = scount+1}
                v :: rest ->
                    { store = updateStore x v store
                    , io = updateIO io "input" rest
                    , riStmts = riStmts
                    , hcount = hcount
                    , scount = scount}
                _ -> {defaultFwdRes | store = [("error", VError "Input not found")]}
        SPrint _ e -> 
            let
                (e_, st) = elaborate store holeBindings e
            in
            if st == TOP then 
                { store = store
                , io = updateIO io "output" ((getIO io "output") ++ [expr2Val e_])
                , riStmts = riStmts
                , hcount = hcount
                , scount = scount
                }
                -- 这里不确定到底update到statement id是多少，看fill的实现决定
            else 
                { store = store
                , io = updateIO io "output" ((getIO io "output") ++ [VHole (HVar hcount) scount])
                , riStmts = riStmts ++ [(scount, SPrint [] e_, (store, io))]
                , hcount = hcount + 1
                , scount = scount + 1
                }

fill : HoleMap -> HoleBindings -> FwdRes -> FwdRes
fill holes hb fwdRes =
    let
        newris = substHole holes fwdRes.riStmts
        (execList, newris_) = tryExec hb newris fwdRes.hcount fwdRes.scount
    in
        if List.isEmpty execList then {fwdRes | riStmts = newris_}
        else
            let (store_, h2eMap) = substHoleInStore fwdRes.store execList Dict.empty in
            let (newris__, h2eMap_) = substHoleInStmtStore newris_ execList h2eMap in
            let newio = substHoleInIO fwdRes.io execList in
            fill h2eMap_ hb {fwdRes | store = store_, riStmts = newris__, io = newio}
        -- let (io_, iomap) = substHoleInIO fwdRes.io execList Dict.empty in

substHoleInStmtStore : RiStmts -> List (StmtID, Store, IO) -> HoleMap -> (RiStmts, HoleMap)
substHoleInStmtStore ris execList h2eMap =
    case ris of
        [] -> ([], h2eMap)
        (id, s, (store, io)) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore store execList h2eMap in
            let (resstmt, newh2eMap_) = substHoleInStmtStore rest execList newh2eMap in
            let newio = substHoleInIO io execList in
            ((id, s, (newstore, newio))::resstmt, newh2eMap_)

tryExec : HoleBindings -> RiStmts -> HCount -> SCount -> (List (StmtID, Store, IO), RiStmts)
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
                        let res = exec store io hb [] (SIf [] e_ (SSeq [] s_ (SWhile ws e s_)) (SSkip [])) hcount scount in
                        let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                        ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                    else
                        let (exec_, stmt_) = tryExec hb rest hcount scount in
                        (exec_, (id, SWhile ws e s_, (store, io))::stmt_)
                SRead _ x -> 
                    let vs = getIO io "input" in
                    case vs of
                        [VHole _ _] -> 
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SRead [] x, (store, io))::stmt_)
                        v :: _ ->
                            let res = exec store io hb [] (SRead [] x) hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                        _ -> ([], [])
                        
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

substHoleInStore : Store -> List (StmtID, Store, IO) -> HoleMap -> (Store, HoleMap)
substHoleInStore store execList h2eMap =
    case store of
        [] -> ([], h2eMap)
        (x, VHole h id) :: rest ->
            if List.any (\(id_, _, _) -> id_ == id) execList then
                let store_ = findStore id execList in
                let val = lookup x store_ in
                case val of
                    Just v ->
                        let nd = Dict.insert (holeKey h) (value2Expr v) h2eMap in
                        let (newstore, newh2eMap) = substHoleInStore rest execList nd in
                        ((x, v)::newstore, newh2eMap)
                    Nothing -> ([], h2eMap)
            else
                let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
                ((x, VHole h id)::newstore, newh2eMap)
        (x, v) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
            ((x, v)::newstore, newh2eMap)

findStore : Int -> List (Int, Store, IO) -> Store
findStore id execList =
    case execList of
        [] -> []
        (id_, store_, _) :: rest ->
            if id_ == id then
                store_
            else
                findStore id rest

substHoleInIO : IO -> List (StmtID, Store, IO) -> IO
substHoleInIO io execList = 
    let input = getIO io "input" in
    let output = getIO io "output" in
    let newinput = substHoleInInput input execList in
    let newoutput = substHoleInOutput output execList 0 in
    [("input", newinput), ("output", newoutput)]
    

substHoleInInput : List Value -> List (StmtID, Store, IO) -> List Value
substHoleInInput input execList =
    case input of
        [VHole h id] -> 
            if List.any (\(id_, _, _) -> id_ == id) execList then
                let io = findIO id execList in
                getIO io "input"
            else [VHole h id]
        _ -> input
        
findIO : Int -> List (Int, Store, IO) -> IO
findIO id execList =
    case execList of
        [] -> []
        (id_, _, io_) :: rest ->
            if id_ == id then
                io_
            else
                findIO id rest

substHoleInOutput : List Value -> List (StmtID, Store, IO) -> Int -> List Value
substHoleInOutput output execList vid =
    case output of
        [] -> []
        (VHole h id) :: rest ->
            if List.any (\(id_, _, _) -> id_ == id) execList then
                let io = findIO id execList in
                let output_ = getIO io "output" in
                (List.drop vid output_) ++ (substHoleInOutput rest execList (vid+1))
            else
                (VHole h id) :: (substHoleInOutput rest execList (vid+1))
        v :: rest ->
            v :: (substHoleInOutput rest execList (vid+1))

