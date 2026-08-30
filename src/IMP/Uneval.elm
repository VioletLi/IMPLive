module IMP.Uneval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Eval exposing (eval, exec)
import IMP.Utils exposing (..)

type alias UnexecRes = 
    { store : Store
    , io : IO
    , holeBindings : HoleBindings
    , riStmts : RiStmts
    , stmt : Stmt
    , hcount : HCount
    }

defaultUnexecRes : UnexecRes
defaultUnexecRes = 
    { store = []
    , io = []
    , holeBindings = []
    , riStmts = []
    , stmt = SSkip []
    , hcount = 0
    }

uneval : Store -> HoleBindings -> IO -> Expr -> Value -> HCount-> (Store, HoleBindings, (Expr, HCount))
uneval store holeBindings io expr val hcount =
    case expr of
        ENot ws e -> 
            let v = eval store holeBindings io e in
            case (v, val) of
                (VHole _ _, VHole _ _) ->
                    (store, holeBindings, (ENot ws e, hcount))

                (VBool b1, VBool b2) ->
                    if b1 /= b2 then
                        (store, holeBindings, (ENot ws e, hcount))
                    else
                        let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e (VBool (not b2)) hcount in
                        (newstore, newhb, (ENot ws newexpr, hcount_))

                (VHole _ _, VBool b) ->
                    let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e (VBool (not b)) hcount in
                    (newstore, newhb, (ENot ws newexpr, hcount_))

                (VBool _, VHole _ _) ->
                    let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e val hcount in
                    (newstore, newhb, (ENot ws newexpr, hcount_))

                _ -> ([],[],(EError "unsupported value type for ENot", 0))
        EParens ws e ->
            let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e val hcount in
            (newstore, newhb, (EParens ws newexpr, hcount_))
        EHole _ u -> 
            case val of
                VHole _ _ -> (store, holeBindings, (expr, hcount))
                _ -> (store, (u, (store, io), val) :: holeBindings, (expr, hcount))
        EVar _ x -> (updateStore x val store, holeBindings, (expr, hcount))
        EInt ws _ -> 
            case val of
                VInt n_ -> (store, holeBindings, (EInt ws n_, hcount))
                VHole _ _ -> (store, holeBindings, (EHole ws (HOri hcount), hcount + 1))
                _ -> ([],[],(EError "unsupported value type for EInt", 0))
        EBool ws _ -> 
            case val of
                VBool b_ -> (store, holeBindings, (EBool ws b_, hcount))
                VHole _ _ -> (store, holeBindings, (EHole ws (HOri hcount), hcount + 1))
                _ -> ([],[],(EError "unsupported value type for EBool", 0))
        EString ws _ -> 
            case val of
                VString s_ -> (store, holeBindings, (EString ws s_, hcount))
                VHole _ _ -> (store, holeBindings, (EHole ws (HOri hcount), hcount + 1))
                _ -> ([],[],(EError "unsupported value type for EString", 0))
        Eop ws op e1 e2 -> 
            let
                logic_ =
                    logic ws e1 e2 holeBindings store io val hcount

                arith_ = 
                    arith ws e1 e2 holeBindings store io val hcount

                comp_ = 
                    comp ws e1 e2 holeBindings store io val hcount
            in
            case op of
                "+" -> arith_ "+"
                "-" -> arith_ "-"
                "*" -> arith_ "*"
                "/" -> arith_ "/"
                "==" -> comp_ "=="
                "!=" -> comp_ "!="
                "<" -> comp_ "<"
                ">" -> comp_ ">"
                "<=" -> comp_ "<="
                ">=" -> comp_ ">="
                "&&" -> logic_ "&&"
                "||" -> logic_ "||"
                "++" -> arith_ "++"
                _ -> ([],[],(EError "unsupported operation", 0))
        EError s -> ([], [], (EError s, 0))

unexec : Store -> IO -> HoleBindings -> RiStmts -> Stmt -> HCount -> SCount -> (Store, RiStmts, IO) -> UnexecRes
unexec store io holeBindings riStmts stmt hcount scount (newstore, newriStmts, newio) =
    case stmt of
        SAssign ws x e -> 
            -- 如果这个生成了新的ristmt，那我就把更新之后的最后一条的store传回给上一条，删掉原来那条，不然就不动
            -- 反向是不是不需要生成新的residual statement？
            let newval = lookup x newstore in
            let val = eval store holeBindings io e in
            let oldval = lookup x store in
            case (val, newval, oldval) of
                (VHole _ _, Just nv, Just ov) -> 
                    case nv of
                        VHole (HVar x_) id_ -> if x_ == x && id_ == scount then 
                            let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                            {
                                store = mergeStore userstore (updateStore x ov newstore) store,
                                io = mergeIO userio newio io,
                                holeBindings = holeBindings,
                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                stmt = stmt,
                                hcount = hcount
                            }
                            else 
                                let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings io e nv hcount in
                                {
                                    store = mergeStore userstore finalstore store,
                                    io = mergeIO userio newio io,
                                    holeBindings = newhb,
                                    riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                    stmt = SAssign ws x newexpr,
                                    hcount = hcount_
                                }
                        _ ->
                            let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings io e nv hcount in
                            {
                                store = mergeStore userstore finalstore store,
                                io = mergeIO userio newio io,
                                holeBindings = newhb,
                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                stmt = SAssign ws x newexpr,
                                hcount = hcount_
                            }
                (_, Just nv, Just ov) ->
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings io e nv hcount in
                    {
                        store = finalstore,
                        io = newio,
                        holeBindings = newhb,
                        riStmts = newriStmts,
                        stmt = SAssign ws x newexpr,
                        hcount = hcount_
                    }
                (VHole _ _, Just nv, Nothing) ->
                    case nv of
                        VHole (HVar x_) id_ -> if x_ == x && id_ == scount then 
                            let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                            {
                                store = mergeStore userstore (delStore x newstore) store,
                                io = mergeIO userio newio io,
                                holeBindings = holeBindings,
                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                stmt = stmt,
                                hcount = hcount
                            }
                            else 
                                let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings io e nv hcount in
                                {
                                    store = mergeStore userstore finalstore store,
                                    io = mergeIO userio newio io,
                                    holeBindings = newhb,
                                    riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                    stmt = SAssign ws x newexpr,
                                    hcount = hcount_
                                }
                        _ ->
                            let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings io e nv hcount in
                            {
                                store = mergeStore userstore finalstore store,
                                io = mergeIO userio newio io,
                                holeBindings = newhb,
                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                stmt = SAssign ws x newexpr,
                                hcount = hcount_
                            }
                (_, Just nv, Nothing) ->
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings io e nv hcount in
                    {
                        store = finalstore,
                        io = newio,
                        holeBindings = newhb,
                        riStmts = newriStmts,
                        stmt = SAssign ws x newexpr,
                        hcount = hcount_
                    }
                _ -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SAssign: newval not found"}
        SSkip _ -> 
            { store = newstore
            , io = newio
            , holeBindings = holeBindings
            , riStmts = newriStmts
            , stmt = stmt
            , hcount = hcount
            }
        SSeq ws s1 s2 -> 
            let fres1 = exec store io holeBindings riStmts s1 scount in
            let bres2 = unexec fres1.store fres1.io holeBindings fres1.riStmts s2 hcount fres1.scount (newstore, newriStmts, newio) in
            let bres1 = unexec store io bres2.holeBindings bres2.riStmts s1 bres2.hcount scount (bres2.store, bres2.riStmts, bres2.io) in
            {
                store = bres1.store,
                io = bres1.io,
                holeBindings = bres1.holeBindings,
                riStmts = bres1.riStmts,
                stmt = SSeq ws bres1.stmt bres2.stmt,
                hcount = bres1.hcount
            }
        SRead ws x -> 
            let vs = getIO io "input" in
            case vs of
                [VHole (HVar "input") id] -> -- stuck的时候怎么更新？如果后面的stuck了反向是不是推不出来完整read也是合理的，只是回滚到之前的？
                    let 
                        (userstore, userio) = getFinalRiStmtStoreIO newriStmts 
                        val = lookup x store
                        newv = lookup x newstore
                    in
                    let 
                        newio_ = 
                            case newv of
                                Just newv_ -> 
                                    case getIO newio "input" of
                                        [VHole _ _] -> userio
                                        lst -> mergeIO userio (updateIO newio "input" (newv_ :: lst)) io
                                Nothing -> []
                    in
                    case newio_ of
                        [] -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SRead: variable missing in new store"}
                        _ ->
                            case val of
                                Just v ->
                                    {
                                        store = mergeStore userstore (updateStore x v newstore) store,
                                        io = newio_,
                                        holeBindings = holeBindings,
                                        riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                        stmt = SRead ws x,
                                        hcount = hcount
                                    }
                                Nothing -> 
                                    {
                                        store = mergeStore userstore (delStore x newstore) store,
                                        io = newio_,
                                        holeBindings = holeBindings,
                                        riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                        stmt = SRead ws x,
                                        hcount = hcount
                                    }
                _ :: rest ->
                    let nv = lookup x newstore in
                    case nv of
                        Just val ->
                            let newio_ = updateIO newio "input" (val :: rest) in
                            let oriv = lookup x store in
                            case oriv of
                                Just v ->
                                    {
                                        store = updateStore x v newstore,
                                        io = newio_,
                                        holeBindings = holeBindings,
                                        riStmts = riStmts,
                                        stmt = SRead ws x,
                                        hcount = hcount
                                    }
                                Nothing ->
                                    {
                                        store = delStore x newstore,
                                        io = newio_,
                                        holeBindings = holeBindings,
                                        riStmts = riStmts,
                                        stmt = SRead ws x,
                                        hcount = hcount
                                    }
                        Nothing -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SRead: val not found" }
                _ -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SRead: input not found"}
        SPrint ws e -> 
            let val = eval store holeBindings io e in
            case val of
                VHole _ _ -> 
                    let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                    let newio_ = mergeIO userio (updateIO newio "output" (List.take ((List.length (getIO newio "output")) - 1) (getIO newio "output"))) io in
                    let newout = getIO newio "output" in
                    let newval = List.head (List.reverse newout) in
                    case newval of
                        Just (VHole (HVar "output") id) -> if id == scount then 
                            {
                                store = mergeStore userstore newstore store,
                                io = newio_,
                                holeBindings = holeBindings,
                                riStmts = newriStmts,
                                stmt = SPrint ws e,
                                hcount = hcount
                            }   
                            else
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e (VHole (HVar "output") id) hcount in
                                    {
                                        store = mergeStore userstore finalstore store,
                                        io = newio_,
                                        holeBindings = newhb,
                                        riStmts = newriStmts,
                                        stmt = SPrint ws newexpr,
                                        hcount = hcount_
                                    }
                        Just v ->
                            let (finalstore, newhb, (newexpr, hcount_)) = uneval store holeBindings io e v hcount in
                            {
                                store = mergeStore userstore finalstore store,
                                io = newio_,
                                holeBindings = newhb,
                                riStmts = newriStmts,
                                stmt = SPrint ws newexpr,
                                hcount = hcount_
                            }
                        Nothing -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SPrint: newval not found"}
                _ ->
                    let newout = getIO newio "output" in
                    let newval = List.head (List.reverse newout) in
                    let newio_ = updateIO newio "output" (List.take ((List.length newout) - 1) (getIO newio "output")) in
                    case newval of
                        Just v ->
                            let (newstore_, newhb, (newexpr, hcount_)) = uneval store holeBindings io e v hcount in
                            {
                                store = newstore_,
                                io = newio_,
                                holeBindings = newhb,
                                riStmts = newriStmts,
                                stmt = SPrint ws newexpr,
                                hcount = hcount_
                            }
                        Nothing -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SPrint: newval not found"}
        SIf ws e s1 s2 -> 
            let guard = eval store holeBindings io e in
            case guard of
                VHole _ _ -> 
                    let oldres = exec store io holeBindings riStmts stmt scount in
                    let (userstore, userio) = getFinalRiStmtStoreIO newriStmts in
                    if isSameStore oldres.store newstore && isSameIO oldres.io io then
                        {
                            store = userstore,
                            io = userio,
                            holeBindings = holeBindings,
                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                            stmt = SIf ws e s1 s2,
                            hcount = hcount
                        }
                    else
                        case (s1, s2) of
                            (SSeq ws1 s_ (SWhile ws2 e_ sw), SSkip _) ->
                                let fres = exec store io holeBindings riStmts s_ scount in
                                let (guardstore, guardhb, (guardexpr, guardhcount)) = uneval fres.store holeBindings io e_ (VBool False) hcount in
                                let bres = unexec store io holeBindings riStmts s_ guardhcount fres.scount (guardstore, newriStmts, newio) in
                                let (exprstore, exprhb, (expr, hcount_)) = uneval store guardhb io e (VBool True) bres.hcount in
                                let unpollutedstore = unpollute exprstore store scount in
                                let unpollutedio = unpolluteIO bres.io io scount in
                                {
                                    store = mergeStore userstore unpollutedstore store,
                                    io = mergeIO userio unpollutedio io,
                                    holeBindings = exprhb,
                                    riStmts = List.take ((List.length bres.riStmts) - 1) bres.riStmts,
                                    stmt = SIf ws expr (SSeq ws1 bres.stmt (SWhile ws2 guardexpr sw)) (SSkip []),
                                    hcount = hcount_
                                }
                            _ ->
                                let bres = unexec store io holeBindings riStmts s1 hcount scount (newstore, newriStmts, newio) in
                                case bres.stmt of
                                    SError _ ->
                                        let bres2 = unexec store io holeBindings riStmts s2 hcount scount (newstore, newriStmts, newio) in
                                        case bres2.stmt of
                                            SError _ ->
                                                { defaultUnexecRes | stmt = SError "Error: unexecStmt: SIf: both branches error"}
                                            _ ->
                                                let (finalstore, newhb, (newexpr, hcount_)) = uneval bres2.store bres2.holeBindings io e (VBool False) bres2.hcount in
                                                let unpollutedstore = unpollute finalstore store scount in
                                                let unpollutedio = unpolluteIO bres2.io io scount in
                                                {
                                                    store = mergeStore userstore unpollutedstore store,
                                                    io = mergeIO userio unpollutedio io,
                                                    holeBindings = newhb,
                                                    riStmts = bres2.riStmts,
                                                    stmt = SIf ws newexpr bres2.stmt s2,
                                                    hcount = hcount_
                                                }
                                    _ ->
                                        let (finalstore, newhb, (newexpr, hcount_)) = uneval bres.store bres.holeBindings io e (VBool True) bres.hcount in
                                        let unpollutedstore = unpollute finalstore store scount in
                                        let unpollutedio = unpolluteIO bres.io io scount in
                                        {
                                            store = mergeStore userstore unpollutedstore store,
                                            io = mergeIO userio unpollutedio io,
                                            holeBindings = newhb,
                                            riStmts = bres.riStmts,
                                            stmt = SIf ws newexpr bres.stmt s2,
                                            hcount = hcount_
                                        }
                VBool True ->
                    let res = unexec store io holeBindings riStmts s1 hcount scount (newstore, newriStmts, newio) in
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval res.store res.holeBindings io e guard res.hcount in
                    {
                        store = finalstore,
                        io = res.io,
                        holeBindings = newhb,
                        riStmts = res.riStmts,
                        stmt = SIf ws newexpr res.stmt s2,
                        hcount = hcount_
                    }
                VBool False ->
                    let res = unexec store io holeBindings riStmts s2 hcount scount (newstore, newriStmts, newio) in
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval res.store res.holeBindings io e guard res.hcount in
                    {
                        store = finalstore,
                        io = res.io,
                        holeBindings = newhb,
                        riStmts = res.riStmts,
                        stmt = SIf ws newexpr s1 res.stmt,
                        hcount = hcount_
                    }
                _ -> {defaultUnexecRes | stmt = SError "Error: unexecStmt: SIf: guard type error"}
        SWhile ws e s -> 
            let res = unexec store io holeBindings riStmts (SIf [] e (SSeq [] s (SWhile ws e s)) (SSkip [])) hcount scount (newstore, newriStmts, newio) in
            case res.stmt of
                SIf _ e_ (SSeq _ s1_ (SWhile _ e2_ s2_)) (SSkip _) ->
                    let 
                        newe = if e2_ /= e then e2_ else e_
                        news = if s2_ /= s then s2_ else s1_
                    in
                        {
                            store = res.store,
                            io = res.io,
                            holeBindings = res.holeBindings,
                            riStmts = res.riStmts,
                            stmt = SWhile ws newe news,
                            hcount = res.hcount
                        }
                _ -> { defaultUnexecRes | stmt = SError "Error: unexecStmt: SWhile: unexpected statement"}
        SError s -> { defaultUnexecRes | stmt = SError s}

logic : WS -> Expr -> Expr -> HoleBindings -> Store -> IO -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
logic ws e1 e2 holeBindings store io val hcount op =
    let v1 = eval store holeBindings io e1 in
    let v2 = eval store holeBindings io e2 in
    let v = eval store holeBindings io (Eop ws op e1 e2) in
    let 
        (newv1, newv2) =
            case v of
                VHole _ _ -> 
                    case ((v1, v2, val), op) of
                        ((VHole _ _, VBool True, VBool True), "&&") -> (VBool True, VBool True)
                        ((VBool True, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)
                        ((VHole _ _, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)

                        ((VHole _ _, VBool True, VBool False), "&&") -> (VBool False, VBool True)
                        ((VBool True, VHole _ _, VBool False), "&&") -> (VBool True, VBool False)
                        ((VHole _ _, VHole _ _, VBool False), "&&") -> (v1, VBool False)

                        ((VHole _ _, VBool False, VBool False), "||") -> (VBool False, VBool False)
                        ((VBool False, VHole _ _, VBool False), "||") -> (VBool False, VBool False)
                        ((VHole _ _, VHole _ _, VBool False), "||") -> (VBool False, VBool False)

                        ((VHole _ _, VBool False, VBool True), "||") -> (VBool True, VBool False)
                        ((VBool False, VHole _ _, VBool True), "||") -> (VBool False, VBool True)
                        ((VHole _ _, VHole _ _, VBool True), "||") -> (v1, VBool True)

                        ((_, _, VHole _ _), "&&") -> (v1, v2)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                VBool True ->
                    case val of
                        VBool True -> (v1, v2)
                        VBool False -> 
                            case op of
                                "&&" -> 
                                    case (v1, v2) of
                                        (VBool True, VBool True) -> (VBool False, VBool True)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                "||" -> 
                                    case (v1, v2) of
                                        (VBool True, VBool True) -> (VBool False, VBool False)
                                        (VBool True, VBool False) -> (VBool False, VBool False)
                                        (VBool False, VBool True) -> (VBool False, VBool False)
                                        (VHole _ _, VBool True) -> (VBool False, VBool False)
                                        (VBool True, VHole _ _) -> (VBool False, VBool False)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        VHole h _ -> (v1, val)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                VBool False ->
                    case val of
                        VBool False -> (v1, v2)
                        VBool True ->
                            case op of
                                "&&" -> 
                                    case (v1, v2) of
                                        (VBool False, VBool False) -> (VBool True, VBool True)
                                        (VBool False, VBool True) -> (VBool True, VBool True)
                                        (VBool True, VBool False) -> (VBool True, VBool True)
                                        (VHole _ _, VBool True) -> (VBool True, VBool True)
                                        (VBool True, VHole _ _) -> (VBool True, VBool True)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                "||" -> 
                                    case (v1, v2) of
                                        (VBool False, VBool False) -> (VBool True, VBool False)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        VHole h _ -> (v1, val)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                _ -> (VError "unsupported operation", VError "unsupported operation")
    in
    case (newv1, newv2) of
        (VError s, VError _) -> ([], [], (EError ("logic: " ++ s), 0))
        _ -> checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op

arith : WS -> Expr -> Expr -> HoleBindings -> Store -> IO -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
arith ws e1 e2 holeBindings store io val hcount op =
    let v1 = eval store holeBindings io e1 in
    let v2 = eval store holeBindings io e2 in
    let v = eval store holeBindings io (Eop ws op e1 e2) in
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings io e2 val hcount in
                            (store_, holeBindings_, (Eop ws op e1 expr_, hcount_))
        VInt n ->
            let 
                (newv1, newv2) =
                    case (v1, v2) of
                        (VHole _ _, VHole _ _) ->
                            case op of
                                "+" -> (VInt n, VInt 0)
                                "-" -> (VInt n, VInt 0)
                                "*" -> (VInt n, VInt 1)
                                "/" -> (VInt n, VInt 1)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        (VInt n1, VHole _ _) ->
                            case op of
                                "+" -> (VInt n1, VInt (n - n1))
                                "-" -> (VInt n1, VInt (n1 - n))
                                "*" -> (VInt n1, VInt (n1 * n))
                                "/" -> (VInt n1, VInt (n1 // n))
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        (VHole _ _, VInt n2) ->
                            case op of  
                                "+" -> (VInt (n - n2), VInt n2)
                                "-" -> (VInt (n + n2), VInt n2)
                                "*" -> (VInt (n // n2), VInt n2)
                                "/" -> (VInt (n * n2), VInt n2)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        (VInt n1, VInt _) ->
                            case op of
                                "+" -> (VInt n1, VInt (n - n1))
                                "-" -> (VInt n1, VInt (n1 - n))
                                "*" -> (VInt n1, VInt (n // n1))
                                "/" -> (VInt n1, VInt (n1 * n))
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        _ -> (VError "unsupported operation", VError "unsupported operation")
            in
            case (newv1, newv2) of
                (VError _, VError _) -> ([], [], (EError ("arith: " ++ op), 0))
                _ -> checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op
        VString s ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, VHole _ _) -> (VString "", VString s)
                                (VString s1, VHole _ _) -> 
                                    let (s1_, s2_) = if (String.length s1) > (String.length s) then (s, "") else (String.left (String.length s1) s, String.dropLeft (String.length s1) s)
                                    in
                                    (VString s1_, VString s2_)
                                (VHole _ _, VString s2) ->
                                    let (s1_, s2_) = if (String.length s2) > (String.length s) then ("", s) else (String.dropRight (String.length s2) s, String.right (String.length s2) s)
                                    in
                                    (VString s1_, VString s2_)
                                (VString s1, VString _) ->
                                    let (s1_, s2_) = if (String.length s1) > (String.length s) then (s, "") else (String.left (String.length s1) s, String.dropLeft (String.length s1) s)
                                    in
                                    (VString s1_, VString s2_)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        _ -> ([], [], (EError ("arith: unsupported operation"), 0))

comp : WS -> Expr -> Expr -> HoleBindings -> Store -> IO -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
comp ws e1 e2 holeBindings store io val hcount op =
    let v1 = eval store holeBindings io e1 in
    let v2 = eval store holeBindings io e2 in
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings io e2 val hcount in
                            (store_, holeBindings_, (Eop ws op e1 expr_, hcount_))
        VBool True ->
            case op of
                "==" -> 
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, VInt n) -> (VInt n, VInt n)
                                (VInt n, VHole _ _) -> (VInt n, VInt n)
                                (VHole _ _, VString s) -> (VString s, VString s)
                                (VString s, VHole _ _) -> (VString s, VString s)
                                (VHole _ _, VBool True) -> (VBool True, VBool True)
                                (VBool True, VHole _ _) -> (VBool True, VBool True)
                                (VHole _ _, VBool False) -> (VBool False, VBool False)
                                (VBool False, VHole _ _) -> (VBool False, VBool False)
                                (VInt n1, VInt n2) -> if n1 == n2 then (v1, v2) else (VInt n1, VInt n1)
                                (VBool True, VBool False) -> (VBool True, VBool True)
                                (VBool False, VBool True) -> (VBool False, VBool False)
                                (VString s1, VString s2) -> if s1 == s2 then (v1, v2) else (VString s1, VString s1)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op
                "!=" -> 
                    case (v1, v2) of
                        (VHole _ _, VHole _ _) -> ([], [], (EError "Cannot infer in neq", 0)) 
                        (VHole _ _, _) -> ([], [], (EError "Cannot infer in neq", 0))
                        (_, VHole _ _) -> ([], [], (EError "Cannot infer in neq", 0))
                        _ -> if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in neq", 0))
                _ ->
                    let v = eval store holeBindings io (Eop ws op e1 e2) in
                    case v of
                        VBool True -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        VBool False ->
                            case op of
                                ">" -> (store, holeBindings, (Eop ws "<=" e1 e2, hcount))
                                "<" -> (store, holeBindings, (Eop ws ">=" e1 e2, hcount))
                                ">=" -> (store, holeBindings, (Eop ws "<" e1 e2, hcount))
                                "<=" -> (store, holeBindings, (Eop ws ">" e1 e2, hcount))
                                _ -> ([], [], (EError "Cannot infer in comp", 0))
                        _ -> ([], [], (EError "Cannot infer in comp", 0))
        VBool False ->
            case op of
                "==" -> 
                    case (v1, v2) of
                            (VHole _ _, VHole _ _) -> ([], [], (EError "Cannot infer in eq", 0)) 
                            (VHole _ _, _) -> ([], [], (EError "Cannot infer in eq", 0))
                            (_, VHole _ _) -> ([], [], (EError "Cannot infer in eq", 0))
                            _ -> if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in eq", 0))
                "!=" ->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, VInt n) -> (VInt n, VInt n)
                                (VInt n, VHole _ _) -> (VInt n, VInt n)
                                (VHole _ _, VString s) -> (VString s, VString s)
                                (VString s, VHole _ _) -> (VString s, VString s)
                                (VHole _ _, VBool True) -> (VBool True, VBool True)
                                (VBool True, VHole _ _) -> (VBool True, VBool True)
                                (VHole _ _, VBool False) -> (VBool False, VBool False)
                                (VBool False, VHole _ _) -> (VBool False, VBool False)
                                (VInt n1, VInt n2) -> if n1 == n2 then (v1, v2) else (VInt n1, VInt n1)
                                (VBool True, VBool False) -> (VBool True, VBool True)
                                (VBool False, VBool True) -> (VBool False, VBool False)
                                (VString s1, VString s2) -> if s1 == s2 then (v1, v2) else (VString s1, VString s1)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in 
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op
                _ ->
                    let v = eval store holeBindings io (Eop ws op e1 e2) in
                    case v of
                        VBool False -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        VBool True ->
                            case op of
                                ">" -> (store, holeBindings, (Eop ws "<=" e1 e2, hcount))
                                "<" -> (store, holeBindings, (Eop ws ">=" e1 e2, hcount))
                                ">=" -> (store, holeBindings, (Eop ws "<" e1 e2, hcount))
                                "<=" -> (store, holeBindings, (Eop ws ">" e1 e2, hcount))
                                _ -> ([], [], (EError "Cannot infer in comp", 0))
                        _ -> ([], [], (EError "Cannot infer in comp", 0))
        _ -> ([], [], (EError "Unsupported value type for comp", 0))


checkChange : WS -> Store -> HoleBindings -> IO -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
checkChange ws store holeBindings io e1 e2 v1 v2 newv1 newv2 hcount op =
    if newv1 == v1 && newv2 == v2 then
        (store, holeBindings, (Eop ws op e1 e2, hcount))
    else if newv1 == v1 then
        let
            (store2, holeBindings2, (expr2, hcount2)) =
                uneval store holeBindings io e2 newv2 hcount
        in
            (store2, holeBindings2, (Eop ws op e1 expr2, hcount2))
    else if newv2 == v2 then
        let
            (store1, holeBindings1, (expr1, hcount1)) =
                uneval store holeBindings io e1 newv1 hcount
        in
            (store1, holeBindings1, (Eop ws op expr1 e2, hcount1))
    else
        let
            (store1, holeBindings1, (expr1, hcount1)) =
                uneval store holeBindings io e1 newv1 hcount
            (store2, holeBindings2, (expr2, hcount2)) =
                uneval store holeBindings io e2 newv2 hcount1
            store_ = mergeStore store1 store2 store
            holeBindings_ = mergeHoleBindings holeBindings1 holeBindings2 holeBindings
        in
            (store_, holeBindings_, (Eop ws op expr1 expr2, hcount2))
        
mergeStore : Store -> Store -> Store -> Store
mergeStore store1 store2 store3 =
    case (store1, store2, store3) of
        ((x1, v1)::store1_, (x2, v2)::store2_, (x3, v3)::store3_) ->
            if v1 /= v3 then (x1, v1) :: mergeStore store1_ store2_ store3_
            else (x2, v2) :: mergeStore store1_ store2_ store3_
        _ -> []

mergeHoleBindings : HoleBindings -> HoleBindings -> HoleBindings -> HoleBindings
mergeHoleBindings hb1 hb2 hb =
    case hb of
        (hn, (store, io), v) :: hb_ ->
            let
                (v1, hb1_) =
                    getElem hn (store, io) hb1

                (v2, hb2_) =
                    getElem hn (store, io) hb2

                newE1 =
                    (hn, (store, io), v1)

                newE2 =
                    (hn, (store, io), v2)

                resMerge = 
                    mergeHoleBindings hb_ hb1_ hb2_
            in
            case v1 of
                VError _ ->
                    newE2 :: resMerge
                _ ->
                    if v1 /= v then
                        newE1 :: resMerge
                    else 
                        newE2 :: resMerge

        [] -> union hb1 hb2

getElem : HoleName -> (Store, IO) -> HoleBindings -> (Value, HoleBindings)
getElem hn (store, io) hb =
    case hb of
        (hn_, (store_, io_), v_) :: hb_ -> 
            if hn == hn_ && isSameStore store store_ && isSameIO io io_ then (v_, hb_) else 
                let (resv, reshb) = getElem hn (store_, io_) hb_ in
                (resv, (hn_, (store_, io_), v_) :: reshb)
        _ -> (VError "unsupported operation", [])

union : HoleBindings -> HoleBindings -> HoleBindings
union hb1 hb2 =
    case hb2 of
        (hn2, (store2, io2), v2)::hb2_ ->
            if elemIn hn2 (store2, io2) hb1 then
                union hb1 hb2_
            else
                (hn2, (store2, io2), v2)::(union hb1 hb2_)

        _ -> hb1

elemIn : HoleName -> (Store, IO) -> HoleBindings -> Bool
elemIn hn (store, io) hb =
    case hb of
        (hn_, (store_, io_), _)::hb_ -> if hn == hn_ && isSameStore store store_ && isSameIO io io_ then True else elemIn hn (store, io) hb_
        _ -> False

getFinalRiStmtStoreIO : RiStmts -> (Store, IO)
getFinalRiStmtStoreIO riStmts =
    case riStmts of
        (_, _, (store, io)) :: [] -> (store, io)
        _ :: rest -> getFinalRiStmtStoreIO rest
        _ -> ([], [])

mergeIO : IO -> IO -> IO -> IO
mergeIO io1 io2 io3 =
    let (input1, input2, input3) = (getIO io1 "input", getIO io2 "input", getIO io3 "input") in
    let (output1, output2, output3) = (getIO io1 "output", getIO io2 "output", getIO io3 "output") in
    let newinput = if input1 /= input3 then input1 else input2 in
    let newoutput = if output1 /= output3 then output1 else output2 in
    [("input", newinput), ("output", newoutput)]

unpollute : Store -> Store -> SCount -> Store
unpollute store oristore scount =
    case store of
        (x, VHole (HVar x_) id) :: store_ -> 
            if x_ == x && id == scount then 
                case lookup x oristore of
                    Just v -> (x, v) :: (unpollute store_ oristore scount)
                    Nothing -> unpollute store_ oristore scount
            else (x, VHole (HVar x_) id) :: (unpollute store_ oristore scount)
        (x, v) :: store_ -> (x, v) :: (unpollute store_ oristore scount)
        _ -> []

unpolluteIO : IO -> IO -> SCount -> IO
unpolluteIO io oriio scount =
    let input = getIO io "input" in
    let output = getIO io "output" in
    let 
        newinput = 
            case input of
                [VHole (HVar "input") id] -> 
                    if id == scount then getIO oriio "input" else input
                _ -> input
        newoutput = 
            case List.reverse output of
                (VHole (HVar "output") id) :: _ -> 
                    if id == scount then getIO oriio "output" else output
                _ -> output
    in
    [("input", newinput), ("output", newoutput)]