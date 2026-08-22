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

eval : Store -> HoleBindings -> Expr -> Value
eval store holeBindings expr =
    case expr of
        EVar _ x -> 
            case lookup x store of
                Just (VHole h id) -> VHole HTmp -1
                Just v -> v
                Nothing -> VError "Variable not found"
        EInt ws i -> VInt i
        EBool ws b -> VBool b
        EString ws s -> VString s
        EHole ws h -> 
            case lookupHB h store holeBindings of
                Just v -> v
                Nothing -> VHole HTmp -1
        Eop ws op e1 e2 -> 
            let 
                v1 = eval store holeBindings e1
                v2 = eval store holeBindings e2
            in 
            bop op v1 v2
        _ -> VError "Unsupported expression"

bop : String -> Value -> Value -> Value
bop op v1 v2 =
    case op of
        "+" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VInt (i1 + i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "-" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VInt (i1 - i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "*" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VInt (i1 * i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "/" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VInt (i1 // i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "==" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 == i2)
                (VBool b1, VBool b2) -> VBool (b1 == b2)
                (VString s1, VString s2) -> VBool (s1 == s2)
                (VHole _ _, _) -> VHole HTmp -1 
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "!=" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 /= i2)
                (VBool b1, VBool b2) -> VBool (b1 /= b2)
                (VString s1, VString s2) -> VBool (s1 /= s2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "<" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 < i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        ">" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 > i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "<=" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 <= i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        ">=" -> 
            case (v1, v2) of
                (VInt i1, VInt i2) -> VBool (i1 >= i2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "&&" -> 
            case (v1, v2) of
                (VBool False, _) -> VBool False
                (_, VBool False) -> VBool False
                (VBool b1, VBool b2) -> VBool (b1 && b2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "||" -> 
            case (v1, v2) of
                (VBool True, _) -> VBool True
                (_, VBool True) -> VBool True
                (VBool b1, VBool b2) -> VBool (b1 || b2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        "++" -> 
            case (v1, v2) of
                (VString s1, VString s2) -> VString (s1 ++ s2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        _ -> VError "Unsupported operation"

simplifyExpr : Store -> Expr -> HoleBindings -> Expr
simplifyExpr store e holeBindings =
    case e of
        EVar _ x ->
            case lookup x store of
                Just v -> value2Expr v
                Nothing -> EError "Variable not found"
        EInt _ i -> EInt [] i
        EBool _ b -> EBool [] b
        EString _ s -> EString [] s
        EHole _ h -> 
            case lookupHB h store holeBindings of
                Just v -> value2Expr v
                Nothing -> EHole [] h
        Eop _ op e1 e2 -> 
            let e1_ = simplifyExpr store e1 holeBindings in
            let e2_ = simplifyExpr store e2 holeBindings in
            Eop [] op e1_ e2_
        _ -> e

exec : Store -> IO -> HoleBindings -> RiStmts -> Stmt -> HCount -> SCount -> FwdRes
exec store io holeBindings riStmts stmt hcount scount =
    case stmt of
        SSkip _ -> {store = store, io = io, riStmts = riStmts, hcount = hcount, scount = scount}
        SAssign _ x e ->
            let
                v = eval store holeBindings e
            in
            case v of
                VHole HTmp _ -> 
                    let e_ = simplifyExpr store e holeBindings in
                    { store = updateStore x (VHole (HVar hcount) scount) store
                    , io = io
                    , riStmts = riStmts ++ [(scount, SAssign [] x e_, (store, io))]
                    , hcount = hcount+1
                    , scount = scount+1}
                VError _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
                _ ->
                    { store = updateStore x v store
                    , io = io
                    , riStmts = riStmts
                    , hcount = hcount
                    , scount = scount}
                
        SSeq _ s1 s2 -> 
            let
                res1 = exec store io holeBindings riStmts s1 hcount scount
                res2 = exec res1.store res1.io holeBindings res1.riStmts s2 res1.hcount res1.scount
            in
            res2
        SIf _ e s1 s2 -> 
            let
                v = eval store holeBindings e
            in
            case v of 
                VHole HTmp _ -> 
                    let
                    -- if和read这些对input和output的变量好像有冲突？
                        e_ = simplifyExpr store e holeBindings
                        mod = unique (modVars s1 ++ (modVars s2))
                        (store_, io_) = polluteState mod store io hcount (\id -> VHole (HVar id) scount)
                    in
                    { store = store_
                    , io = io_
                    , riStmts = riStmts ++ [(scount, SIf [] e_ s1 s2, (store, io))]
                    , hcount = hcount + List.length mod
                    , scount = scount + 1
                    }
                VBool True -> exec store io holeBindings riStmts s1 hcount scount
                VBool False -> exec store io holeBindings riStmts s2 hcount scount
                _ -> {defaultFwdRes|store=[("error", VError "Unsupported guard of If")]}
                
        SWhile _ e s -> 
            case eval store holeBindings e of
                VHole HTmp _ -> 
                    let 
                        e_ = simplifyExpr store e holeBindings
                        mod = unique (modVars s) 
                        (store_, io_) = polluteState mod store io hcount (\id -> VHole (HVar id) scount)
                    in
                    { store = store_
                    , io = io_
                    , riStmts = riStmts ++ [(scount, SIf [] e_ (SSeq [] s (SWhile [] e s)) (SSkip []), (store, io))]
                    , hcount = hcount + List.length mod
                    , scount = scount + 1
                    }
                VBool True -> exec store io holeBindings riStmts (SSeq [] s stmt) hcount scount
                VBool False -> 
                    { store = store
                    , io = io
                    , riStmts = riStmts
                    , hcount = hcount
                    , scount = scount}
                _ -> {defaultFwdRes | store = [("error", VError "Unsupported guard of While")]}
                
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
            case eval store holeBindings e of
                VHole HTmp _ -> 
                    let
                        e_ = simplifyExpr store e holeBindings
                    in
                    { store = store
                    , io = updateIO io "output" ((getIO io "output") ++ [VHole (HVar hcount) scount])
                    , riStmts = riStmts ++ [(scount, SPrint [] e_, (store, io))]
                    , hcount = hcount + 1
                    , scount = scount + 1
                    }
                VError _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
                v ->
                    { store = store
                    , io = updateIO io "output" ((getIO io "output") ++ [v])
                    , riStmts = riStmts
                    , hcount = hcount
                    , scount = scount
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
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e hb in
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SAssign ws x e_, (store, io))::stmt_)
                        _ ->
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            ((id, updateStore x v store, io)::exec_, stmt_)
                        
                SIf ws e s1 s2 -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e hb in
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SIf ws e_ s1 s2, (store, io))::stmt_)
                        VBool True ->
                            let res = exec store io hb [] s1 hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                        VBool False -> 
                            let res = exec store io hb [] s2 hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                        _ -> ([], [])
                SWhile ws e s_ -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SWhile ws e s_, (store, io))::stmt_)
                        VBool True ->
                            let res = exec store io hb [] (SSeq [] s_ (SWhile ws e s_)) hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                        VBool False -> 
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            ((id, store, io)::exec_, stmt_)
                        _ -> ([], [])
                SRead _ x -> 
                    let vs = getIO io "input" in
                    case vs of
                        [VHole _ _] -> 
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SRead [] x, (store, io))::stmt_)
                        _ :: _ ->
                            let res = exec store io hb [] (SRead [] x) hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
                        _ -> ([], [])
                        
                SPrint ws e -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e hb in
                            let (exec_, stmt_) = tryExec hb rest hcount scount in
                            (exec_, (id, SPrint ws e_, (store, io))::stmt_)
                        _ ->
                            let res = exec store io hb [] (SPrint ws e) hcount scount in
                            let (exec_, stmt_) = tryExec hb rest res.hcount res.scount in
                            ((id, res.store, res.io)::exec_, res.riStmts++stmt_)
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

