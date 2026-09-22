module IMP.Uneval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Eval exposing (eval, exec, findIndex, ParamBind, bindParamsParallel)
import IMP.Utils exposing (..)
import Set exposing (Set)

type alias UnexecRes = 
    { store : Store
    , holeBindings : HoleBindings
    , riStmts : RiStmts
    , stmt : Stmt
    , hcount : HCount
    , funcEnv : FuncEnv
    }

defaultUnexecRes : UnexecRes
defaultUnexecRes = 
    { store = []
    , holeBindings = []
    , riStmts = []
    , stmt = SSkip []
    , hcount = 0
    , funcEnv = []
    }

uneval : Store -> HoleBindings -> Expr -> Set String -> Value -> HCount -> (Store, HoleBindings, (Expr, HCount))
uneval store holeBindings expr readOnly val hcount =
    case expr of
        ENot ws e -> 
            let v = eval store holeBindings e in
            case (v, val) of
                (VHole _ _, VHole _ _) ->
                    (store, holeBindings, (ENot ws e, hcount))

                (VBool b1, VBool b2) ->
                    if b1 /= b2 then
                        (store, holeBindings, (ENot ws e, hcount))
                    else
                        let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings e readOnly (VBool (not b2)) hcount in
                        (newstore, newhb, (ENot ws newexpr, hcount_))

                (VHole _ _, VBool b) ->
                    let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings e readOnly (VBool (not b)) hcount in
                    (newstore, newhb, (ENot ws newexpr, hcount_))

                (VBool _, VHole _ _) ->
                    let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings e readOnly val hcount in
                    (newstore, newhb, (ENot ws newexpr, hcount_))

                _ -> ([],[],(EError "unsupported value type for ENot", 0))
        EParens ws e ->
            let (newstore, newhb, (newexpr, hcount_)) = uneval store holeBindings e readOnly val hcount in
            (newstore, newhb, (EParens ws newexpr, hcount_))
        EHole _ u -> 
            case val of
                VHole _ _ -> (store, holeBindings, (expr, hcount))
                _ -> (store, insertHB (u, store, val) holeBindings, (expr, hcount))
        EVar _ x -> 
            let oriv = lookup x store in
            case oriv of
                Just v -> 
                    if v == val then (store, holeBindings, (expr, hcount))
                    else if Set.member x readOnly then ([], [], (EError "variable is read only", 0))
                    else (updateStore x val store, holeBindings, (expr, hcount))
                Nothing -> ([], [], (EError "variable not found when updating", 0))
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
                    logic ws e1 e2 holeBindings store readOnly val hcount

                arith_ = 
                    arith ws e1 e2 holeBindings store readOnly val hcount

                comp_ = 
                    comp ws e1 e2 holeBindings store readOnly val hcount
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
        EList ws es -> 
            case val of
                VList vs ->
                    if List.length vs == List.length es then 
                        let (newstore, newhb, (newexprs, hcount_)) = unevalList store holeBindings readOnly es vs hcount in
                        (newstore, newhb, (EList ws newexprs, hcount_))
                    else 
                        if List.length vs > List.length es then
                            let (newstore, newhb, (newexprs, hcount_)) = unevalList store holeBindings readOnly es (List.take (List.length es) vs) hcount in
                            (newstore, newhb, ((EList ws (newexprs ++ (List.map (value2Expr) (List.drop (List.length es) vs)))), hcount_))
                        else
                            let (newstore, newhb, (newexprs, hcount_)) = unevalList store holeBindings readOnly (List.take (List.length vs) es) vs hcount in
                            (newstore, newhb, (EList ws newexprs, hcount_))
                VHole _ _ ->
                    (store, holeBindings, (EHole ws (HOri hcount), hcount + 1))
                _ -> ([],[],(EError "unsupported value type for EList", 0))
        EIndex _ _ _ ->
            let (x, path) = findIndex store holeBindings expr in
            case path of
                VHole _ _ ->
                    (store, holeBindings, (expr, hcount))
                VList _ ->
                    if x == "error" then
                        ([], [], (EError "error", 0))
                    else if Set.member x readOnly then
                        ([], [], (EError "variable is read only", 0))
                    else
                        case lookup x store of
                            Just (VHole _ _) ->
                                (store, holeBindings, (expr, hcount))
                            Just xv ->
                                let newx = writeIndexValue path xv val in
                                case newx of
                                    VError _ ->
                                        (store, holeBindings, (expr, hcount))
                                    _ ->
                                        (updateStore x newx store, holeBindings, (expr, hcount))
                            Nothing ->
                                ([], [], (EError "variable not found when updating", 0))
                _ ->
                    ([], [], (EError "unsupported expression", 0))
        ELength ws e ->
            let v = eval store holeBindings e in
            case (v, val) of
                (VString s, VInt n) -> if n == String.length s then 
                    (store, holeBindings, (expr, hcount))
                    else ([],[],(EError "length mismatch", 0))
                (VList vs, VInt n) -> if n == List.length vs then 
                    (store, holeBindings, (expr, hcount))
                    else ([],[],(EError "length mismatch", 0))
                (VHole _ _, VHole _ _) -> (store, holeBindings, (expr, hcount))
                _ -> ([],[],(EError "unsupported update for list length", 0))
        -- _ -> ([],[],(EError "unsupported expression", 0))

insertHB : (HoleName, Store, Value) -> HoleBindings -> HoleBindings
insertHB (h, s, v) hb =
    case getElem h s hb of
        (VError _, _) -> (h, s, v) :: hb
        (_, hb_) -> (h, s, v) :: hb_

unevalList : Store -> HoleBindings -> Set String -> List Expr -> List Value -> HCount -> (Store, HoleBindings, (List Expr, HCount))
unevalList store holeBindings readOnly es vs hcount =
    case (es, vs) of
        (e :: es_, v :: vs_) ->
            let
                (storeTail, hbTail, (exprs, hcount_)) =
                    unevalList store holeBindings readOnly es_ vs_ hcount

                (storeHead, hbHead, (eexpr, hcount__)) =
                    uneval store holeBindings e readOnly v hcount_
            in
            ( mergeStore storeHead storeTail store
            , mergeHoleBindings hbHead hbTail holeBindings
            , (eexpr :: exprs, hcount__)
            )

        _ ->
            (store, holeBindings, ([], hcount))

unexecArgBinds : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> List ParamBind -> UnexecRes -> Result String ( UnexecRes, List Expr )
unexecArgBinds funcEnv origStore origHB origRi callRO steps acc =
    case steps of
        [] ->
            Ok ( acc, [] )

        _ ->
            unexecArgBindsMerge funcEnv origStore origHB origRi callRO steps acc


unexecArgBindsMerge : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> List ParamBind -> UnexecRes -> Result String ( UnexecRes, List Expr )
unexecArgBindsMerge funcEnv origStore origHB origRi callRO steps acc =
    case steps of
        [] ->
            Ok ( { acc | store = origStore, holeBindings = origHB }, [] )

        step :: rest ->
            case unexecArgBindsMerge funcEnv origStore origHB origRi callRO rest acc of
                Err info ->
                    Err info

                Ok ( later, es ) ->
                    let
                        target =
                            overlayParams [ step.param ] acc.store origStore

                        r =
                            unexec funcEnv
                                origStore
                                origHB
                                origRi
                                callRO
                                (SAssign [] (EVar [] step.param) step.arg)
                                later.hcount
                                step.scount
                                ( target, later.riStmts )
                    in
                    case r.stmt of
                        SAssign _ _ e ->
                            Ok
                                ( { r
                                    | store = mergeStore r.store later.store origStore
                                    , holeBindings = mergeHoleBindings r.holeBindings later.holeBindings origHB
                                    , funcEnv = later.funcEnv
                                  }
                                , e :: es
                                )

                        SError info ->
                            Err info

                        _ ->
                            Err "Error: unexecStmt: SFuncCall: unexpected statement"


unexecFuncCall : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> HCount -> SCount -> ( Store, RiStmts ) -> WS -> String -> List Expr -> UnexecRes
unexecFuncCall funcEnv store holeBindings riStmts readOnly hcount scount ( newstore, newriStmts ) ws name args =
    case lookupFunc name funcEnv of
        Nothing ->
            { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Function not found" }

        Just ( params, body ) ->
            if List.length params /= List.length args then
                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Argument count mismatch" }

            else
                let
                    callRO =
                        List.foldl Set.remove readOnly params

                    ( bound, steps ) =
                        bindParamsParallel funcEnv store holeBindings riStmts callRO scount params args
                in
                if isErrorStore bound.store then
                    { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error in function call" }

                else
                    let
                        target =
                            overlayParams params bound.store newstore

                        bresBody =
                            unexec funcEnv bound.store holeBindings bound.riStmts callRO body hcount bound.scount ( target, newriStmts )
                    in
                    case bresBody.stmt of
                        SError _ ->
                            bresBody

                        _ ->
                            case unexecArgBinds funcEnv store holeBindings riStmts callRO steps bresBody of
                                Err info ->
                                    { defaultUnexecRes | funcEnv = bresBody.funcEnv, stmt = SError info }

                                Ok ( bresBinds, newArgs ) ->
                                    { bresBinds
                                        | store = restoreParams (snapshotParams params newstore) bresBinds.store
                                        , stmt = SFuncCall ws name newArgs
                                        , funcEnv = updateFuncEnv name bresBody.stmt bresBinds.funcEnv
                                    }


unexec : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> Stmt -> HCount -> SCount -> (Store, RiStmts) -> UnexecRes
unexec funcEnv store holeBindings riStmts readOnly stmt hcount scount (newstore, newriStmts) =
    case stmt of
        SAssign ws e1 e2 -> 
            -- 如果这个生成了新的ristmt，那我就把更新之后的最后一条的store传回给上一条，删掉原来那条，不然就不动
            -- 反向是不是不需要生成新的residual statement？
            case e1 of
                EVar ws1 x ->
                    let newval = lookup x newstore in
                    let val = eval store holeBindings e2 in
                    let oldval = lookup x store in
                    case (val, newval, oldval) of
                        (VHole _ _, Just nv, Just ov) -> 
                            case nv of
                                VHole (HVar x_) id_ -> 
                                    if x_ == x && id_ == scount then 
                                        -- 就是这一轮的final store，前向是hole反向回来也是hole，expression不动
                                        let userstore = getFinalRiStmtStore newriStmts in
                                        {
                                            store = mergeStore userstore (updateStore x ov newstore) store,
                                            holeBindings = holeBindings,
                                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                            stmt = stmt,
                                            hcount = hcount
                                            , funcEnv = funcEnv
                                        }
                                        else 
                                        -- 不是这轮的final store，是某个修改后传回来的结果，应该更新当前轮expression
                                            let userstore = getFinalRiStmtStore newriStmts in
                                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings e2 readOnly nv hcount in
                                            {
                                                store = mergeStore userstore finalstore store,
                                                holeBindings = newhb,
                                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                                stmt = SAssign ws (EVar ws1 x) newexpr,
                                                hcount = hcount_
                                                , funcEnv = funcEnv
                                            }
                                _ ->
                                    -- 不是hole，是某个修改后传回来的结果，应该更新当前轮expression
                                    let userstore = getFinalRiStmtStore newriStmts in
                                    let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings e2 readOnly nv hcount in
                                    {
                                        store = mergeStore userstore finalstore store,
                                        holeBindings = newhb,
                                        riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                        stmt = SAssign ws (EVar ws1 x) newexpr,
                                        hcount = hcount_
                                        , funcEnv = funcEnv
                                    }
                        (VList vs, Just nv, Just ov) ->
                            if hasHole vs then
                                let userstore = getFinalRiStmtStore newriStmts in
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings e2 readOnly nv hcount in
                                {
                                    store = mergeStore userstore finalstore store,
                                    holeBindings = newhb,
                                    riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                    stmt = SAssign ws (EVar ws1 x) newexpr,
                                    hcount = hcount_
                                    , funcEnv = funcEnv
                                }
                                else
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings e2 readOnly nv hcount in
                                {
                                    store = finalstore,
                                    holeBindings = newhb,
                                    riStmts = newriStmts,
                                    stmt = SAssign ws (EVar ws1 x) newexpr,
                                    hcount = hcount_
                                    , funcEnv = funcEnv
                                }
                        (_, Just nv, Just ov) ->
                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (updateStore x ov newstore) holeBindings e2 readOnly nv hcount in
                            {
                                store = finalstore,
                                holeBindings = newhb,
                                riStmts = newriStmts,
                                stmt = SAssign ws (EVar ws1 x) newexpr,
                                hcount = hcount_
                                , funcEnv = funcEnv
                            }
                        (VHole _ _, Just nv, Nothing) ->
                            case nv of
                                VHole (HVar x_) id_ -> 
                                    if x_ == x && id_ == scount then 
                                        let userstore = getFinalRiStmtStore newriStmts in
                                        {
                                            store = mergeStore userstore (delStore x newstore) store,
                                            holeBindings = holeBindings,
                                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                            stmt = stmt,
                                            hcount = hcount
                                            , funcEnv = funcEnv
                                        }
                                        else 
                                            let userstore = getFinalRiStmtStore newriStmts in
                                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings e2 readOnly nv hcount in
                                            {
                                                store = mergeStore userstore finalstore store,
                                                holeBindings = newhb,
                                                riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                                stmt = SAssign ws (EVar ws1 x) newexpr,
                                                hcount = hcount_
                                                , funcEnv = funcEnv
                                            }
                                _ ->
                                    let userstore = getFinalRiStmtStore newriStmts in
                                    let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings e2 readOnly nv hcount in
                                    {
                                        store = mergeStore userstore finalstore store,
                                        holeBindings = newhb,
                                        riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                        stmt = SAssign ws (EVar ws1 x) newexpr,
                                        hcount = hcount_
                                        , funcEnv = funcEnv
                                    }
                        (VList vs, Just nv, Nothing) ->
                            if hasHole vs then
                                let userstore = getFinalRiStmtStore newriStmts in
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings e2 readOnly nv hcount in
                                {
                                    store = mergeStore userstore finalstore store,
                                    holeBindings = newhb,
                                    riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                    stmt = SAssign ws (EVar ws1 x) newexpr,
                                    hcount = hcount_
                                    , funcEnv = funcEnv
                                }
                            else
                                let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings e2 readOnly nv hcount in
                                {
                                    store = finalstore,
                                    holeBindings = newhb,
                                    riStmts = newriStmts,
                                    stmt = SAssign ws (EVar ws1 x) newexpr,
                                    hcount = hcount_
                                    , funcEnv = funcEnv
                                }
                        (_, Just nv, Nothing) ->
                            let (finalstore, newhb, (newexpr, hcount_)) = uneval (delStore x newstore) holeBindings e2 readOnly nv hcount in
                            {
                                store = finalstore,
                                holeBindings = newhb,
                                riStmts = newriStmts,
                                stmt = SAssign ws (EVar ws1 x) newexpr,
                                hcount = hcount_
                                , funcEnv = funcEnv
                            }
                        _ -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SAssign: newval not found"}
                EIndex _ _ _ ->
                    let (x, path) = findIndex store holeBindings e1 in
                    let oldv = lookup x store in
                    let newv = lookup x newstore in
                    let val = eval store holeBindings e2 in
                    case (path, oldv, newv) of
                        -- IndetLoc：整棵还原，不改 e2
                        (VHole _ _, Just ov, Just _) ->
                            let userstore = getFinalRiStmtStore newriStmts in
                            { store = mergeStore userstore (updateStore x ov newstore) store
                            , holeBindings = holeBindings
                            , riStmts = List.take (List.length newriStmts - 1) newriStmts
                            , stmt = stmt
                            , hcount = hcount
                            , funcEnv = funcEnv
                            }
                        -- 基值已是 hole，construct 无法按下标写，同样按 IndetLoc 整棵还原
                        (VList _, Just ((VHole _ _) as ov), Just _) ->
                            let userstore = getFinalRiStmtStore newriStmts in
                            { store = mergeStore userstore (updateStore x ov newstore) store
                            , holeBindings = holeBindings
                            , riStmts = List.take (List.length newriStmts - 1) newriStmts
                            , stmt = stmt
                            , hcount = hcount
                            , funcEnv = funcEnv
                            }
                        -- path 确定
                        (VList p, Just ov, Just nv) ->
                            let
                                vprime = findVal (VList p) nv
                                vo = findVal (VList p) ov
                                store1 = updateStore x (updateValue (VList p) nv vo) newstore
                                userstore = getFinalRiStmtStore newriStmts
                                pop =
                                    List.take (List.length newriStmts - 1) newriStmts
                            in
                            case (val, vprime) of
                                -- 本轮留下的标量洞，用户没改
                                (VHole _ _, VHole _ id) ->
                                    if id == scount then
                                        { store = mergeStore userstore store1 store
                                        , holeBindings = holeBindings
                                        , riStmts = pop
                                        , stmt = stmt
                                        , hcount = hcount
                                        , funcEnv = funcEnv
                                        }
                                    else
                                        let (finalstore, newhb, (newexpr, hcount_)) =
                                                uneval store1 holeBindings e2 readOnly vprime hcount
                                        in
                                        { store = mergeStore userstore finalstore store
                                        , holeBindings = newhb
                                        , riStmts = pop
                                        , stmt = SAssign ws e1 newexpr
                                        , hcount = hcount_
                                        , funcEnv = funcEnv
                                        }
                                -- RHS 不确定（标量洞或带洞 list），用户改了或 list residual
                                (VHole _ _, _) ->
                                    let (finalstore, newhb, (newexpr, hcount_)) =
                                            uneval store1 holeBindings e2 readOnly vprime hcount
                                    in
                                    { store = mergeStore userstore finalstore store
                                    , holeBindings = newhb
                                    , riStmts = pop
                                    , stmt = SAssign ws e1 newexpr
                                    , hcount = hcount_
                                    , funcEnv = funcEnv
                                    }
                                (VList vs, _) ->
                                    if hasHole vs then
                                        let (finalstore, newhb, (newexpr, hcount_)) =
                                                uneval store1 holeBindings e2 readOnly vprime hcount
                                        in
                                        { store = mergeStore userstore finalstore store
                                        , holeBindings = newhb
                                        , riStmts = pop
                                        , stmt = SAssign ws e1 newexpr
                                        , hcount = hcount_
                                        , funcEnv = funcEnv
                                        }
                                    else
                                        let (finalstore, newhb, (newexpr, hcount_)) =
                                                uneval store1 holeBindings e2 readOnly vprime hcount
                                        in
                                        { store = finalstore
                                        , holeBindings = newhb
                                        , riStmts = newriStmts
                                        , stmt = SAssign ws e1 newexpr
                                        , hcount = hcount_
                                        , funcEnv = funcEnv
                                        }
                                -- 确定赋值
                                _ ->
                                    let (finalstore, newhb, (newexpr, hcount_)) =
                                            uneval store1 holeBindings e2 readOnly vprime hcount
                                    in
                                    { store = finalstore
                                    , holeBindings = newhb
                                    , riStmts = newriStmts
                                    , stmt = SAssign ws e1 newexpr
                                    , hcount = hcount_
                                    , funcEnv = funcEnv
                                    }
                        (_, Just ov, Just _) ->
                            let userstore = getFinalRiStmtStore newriStmts in
                            { store = mergeStore userstore (updateStore x ov newstore) store
                            , holeBindings = holeBindings
                            , riStmts = List.take (List.length newriStmts - 1) newriStmts
                            , stmt = stmt
                            , hcount = hcount
                            , funcEnv = funcEnv
                            }
                        _ ->
                            { store = newstore
                            , holeBindings = holeBindings
                            , riStmts = newriStmts
                            , stmt = stmt
                            , hcount = hcount
                            , funcEnv = funcEnv
                            }
                _ ->
                    { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SAssign: unsupported lhs" }
                            
        SSkip _ -> 
            { store = newstore
            , holeBindings = holeBindings
            , riStmts = newriStmts
            , stmt = stmt
            , hcount = hcount
            , funcEnv = funcEnv
            }
        SSeq ws s1 s2 -> 
            let fres1 = exec funcEnv store holeBindings riStmts s1 readOnly scount in
            let bres2 = unexec funcEnv fres1.store holeBindings fres1.riStmts fres1.readOnly s2 hcount fres1.scount (newstore, newriStmts) in
            let bres1 = unexec funcEnv store bres2.holeBindings bres2.riStmts readOnly s1 bres2.hcount scount (bres2.store, bres2.riStmts) in
            {
                store = bres1.store,
                holeBindings = bres1.holeBindings,
                riStmts = bres1.riStmts,
                stmt = SSeq ws bres1.stmt bres2.stmt,
                hcount = bres1.hcount
                , funcEnv = mergeFuncEnv bres1.funcEnv bres2.funcEnv funcEnv
            }
        SRead ws x -> 
            let newinput = lookup "input" newstore in
            let oldinput = lookup "input" store in
            let newx = lookup x newstore in
            let oldx = lookup x store in
            case (newinput, oldinput) of
                (Just (VHole (HVar "input") newid), Just (VHole (HVar "input") id)) ->
                    case newx of
                        Just v ->
                            if newid == scount && v == (VHole (HVar x) scount) then
                            -- 没有发生更新
                                case oldx of
                                    Just ov ->
                                        let userstore = getFinalRiStmtStore newriStmts in
                                        let store_ = updateStore x ov newstore in
                                        {
                                            store = mergeStore userstore (updateStore "input" (VHole (HVar "input") id) newstore) store,
                                            holeBindings = holeBindings,
                                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                            stmt = stmt,
                                            hcount = hcount
                                            , funcEnv = funcEnv
                                        }
                                    Nothing -> 
                                        let userstore = getFinalRiStmtStore newriStmts in
                                        let store_ = delStore x newstore in
                                        {
                                            store = mergeStore userstore (updateStore "input" (VHole (HVar "input") id) store_) store,
                                            holeBindings = holeBindings,
                                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                                            stmt = stmt,
                                            hcount = hcount
                                            , funcEnv = funcEnv
                                        }
                            else 
                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input updated"}
                        Nothing ->
                            { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input variable not found"}
                (Just (VList vs), Just (VList os)) ->
                    case (newx, oldx) of
                        (Just v, Just ov) ->
                            if (v :: vs) == os then
                                let store_ = updateStore x ov newstore in
                                {
                                    store = updateStore "input" (VList os) store_,
                                    holeBindings = holeBindings,
                                    riStmts = newriStmts,
                                    stmt = stmt,
                                    hcount = hcount
                                    , funcEnv = funcEnv
                                }
                            else
                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input length mismatch"}
                        (Just v, Nothing) ->
                            if (v :: vs) == os then
                                let store_ = delStore x newstore in
                                {
                                    store = updateStore "input" (VList os) store_,
                                    holeBindings = holeBindings,
                                    riStmts = newriStmts,
                                    stmt = stmt,
                                    hcount = hcount
                                    , funcEnv = funcEnv
                                }
                            else
                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input length mismatch"}
                        _ -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input not found"}
                _ -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SRead: input not found"}
            
        SPrint ws e ->
            let
                val = eval store holeBindings e
                newout = lookup "output" newstore
                oldout = lookup "output" store
            in
            case (newout, oldout) of
                (Just (VList vs), Just (VList os)) ->
                    if List.length vs == List.length os + 1 then
                        case List.head (List.reverse vs) of
                            Just vprime ->
                                let
                                    store1 =
                                        updateStore "output" (VList (List.take (List.length os) vs)) newstore

                                    userstore =
                                        getFinalRiStmtStore newriStmts

                                    pop =
                                        List.take (List.length newriStmts - 1) newriStmts

                                    goUneval merge pop_ =
                                        let
                                            (finalstore, newhb, (newexpr, hcount_)) =
                                                uneval store1 holeBindings e readOnly vprime hcount
                                        in
                                        { store =
                                            if merge then
                                                mergeStore userstore finalstore store
                                            else
                                                finalstore
                                        , holeBindings = newhb
                                        , riStmts = pop_
                                        , stmt = SPrint ws newexpr
                                        , hcount = hcount_
                                        , funcEnv = funcEnv
                                        }
                                in
                                case (val, vprime) of
                                    -- 本轮标量洞，用户没改
                                    (VHole _ _, VHole _ id) ->
                                        if id == scount then
                                            { store = mergeStore userstore store1 store
                                            , holeBindings = holeBindings
                                            , riStmts = pop
                                            , stmt = stmt
                                            , hcount = hcount
                                            , funcEnv = funcEnv
                                            }
                                        else
                                            goUneval True pop

                                    -- RHS 不确定，用户改了或 list residual
                                    (VHole _ _, _) ->
                                        goUneval True pop

                                    (VList vs2, _) ->
                                        if hasHole vs2 then
                                            goUneval True pop
                                        else
                                            goUneval False newriStmts

                                    -- 确定 print
                                    _ ->
                                        goUneval False newriStmts

                            Nothing ->
                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SPrint: newval not found" }
                    else
                        { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SPrint: output length mismatch" }

                _ ->
                    { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SPrint: output not found" }        
        SIf ws e s1 s2 -> 
            let guard = eval store holeBindings e in
            case guard of
                VHole _ _ -> 
                    let oldres = exec funcEnv store holeBindings riStmts stmt readOnly scount in
                    let userstore = getFinalRiStmtStore newriStmts in
                    if isSameStore oldres.store newstore then
                        {
                            store = userstore,
                            holeBindings = holeBindings,
                            riStmts = List.take ((List.length newriStmts) - 1) newriStmts,
                            stmt = SIf ws e s1 s2,
                            hcount = hcount
                            , funcEnv = funcEnv
                        }
                    else
                        case (s1, s2) of
                            (SSeq ws1 s_ (SWhile ws2 e_ sw), SSkip _) ->
                                case eval newstore holeBindings e of
                                    VBool False ->
                                        let
                                            fres =
                                                exec funcEnv store holeBindings riStmts s_ readOnly (scount + 1)

                                            bres =
                                                unexec funcEnv store holeBindings riStmts readOnly s_ hcount (scount + 1) ( newstore, fres.riStmts )
                                        in
                                        case eval bres.store bres.holeBindings e of
                                            VBool True ->
                                                let
                                                    unpollutedstore =
                                                        unpollute bres.store store scount
                                                in
                                                { store = mergeStore userstore unpollutedstore store
                                                , holeBindings = bres.holeBindings
                                                , riStmts = List.take (List.length newriStmts - 1) newriStmts
                                                , stmt = SIf ws e (SSeq ws1 bres.stmt (SWhile ws2 e_ sw)) (SSkip [])
                                                , hcount = bres.hcount
                                                , funcEnv = bres.funcEnv
                                                }

                                            _ ->
                                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SWhile: guard is not true before the last iteration" }

                                    _ ->
                                        { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SWhile: guard is not false after the loop" }
                            _ ->
                                let bres = unexec funcEnv store holeBindings riStmts readOnly s1 hcount scount (newstore, newriStmts) in
                                case bres.stmt of
                                    SError _ ->
                                        let bres2 = unexec funcEnv store holeBindings riStmts readOnly s2 hcount scount (newstore, newriStmts) in
                                        case bres2.stmt of
                                            SError _ ->
                                                { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SIf: both branches error"}
                                            _ ->
                                                let (finalstore, newhb, (newexpr, hcount_)) = uneval bres2.store bres2.holeBindings e readOnly (VBool False) bres2.hcount in
                                                let unpollutedstore = unpollute finalstore store scount in
                                                {
                                                    store = mergeStore userstore unpollutedstore store,
                                                    holeBindings = newhb,
                                                    riStmts = bres2.riStmts,
                                                    stmt = SIf ws newexpr s1 bres2.stmt,
                                                    hcount = hcount_
                                                    , funcEnv = bres2.funcEnv
                                                }
                                    _ ->
                                        let (finalstore, newhb, (newexpr, hcount_)) = uneval bres.store bres.holeBindings e readOnly (VBool True) bres.hcount in
                                        let unpollutedstore = unpollute finalstore store scount in
                                        {
                                            store = mergeStore userstore unpollutedstore store,
                                            holeBindings = newhb,
                                            riStmts = bres.riStmts,
                                            stmt = SIf ws newexpr bres.stmt s2,
                                            hcount = hcount_
                                            , funcEnv = bres.funcEnv
                                        }
                VBool True ->
                    let res = unexec funcEnv store holeBindings riStmts readOnly s1 hcount scount (newstore, newriStmts) in
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval res.store res.holeBindings e readOnly guard res.hcount in
                    {
                        store = finalstore,
                        holeBindings = newhb,
                        riStmts = res.riStmts,
                        stmt = SIf ws newexpr res.stmt s2,
                        hcount = hcount_
                        , funcEnv = res.funcEnv
                    }
                VBool False ->
                    let res = unexec funcEnv store holeBindings riStmts readOnly s2 hcount scount (newstore, newriStmts) in
                    let (finalstore, newhb, (newexpr, hcount_)) = uneval res.store res.holeBindings e readOnly guard res.hcount in
                    {
                        store = finalstore,
                        holeBindings = newhb,
                        riStmts = res.riStmts,
                        stmt = SIf ws newexpr s1 res.stmt,
                        hcount = hcount_
                        , funcEnv = res.funcEnv
                    }
                _ -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SIf: guard type error"}
        SWhile ws e s -> 
            let res = unexec funcEnv store holeBindings riStmts readOnly (SIf [] e (SSeq [] s (SWhile ws e s)) (SSkip [])) hcount scount (newstore, newriStmts) in
            case res.stmt of
                SIf _ e_ (SSeq _ s1_ (SWhile _ e2_ s2_)) (SSkip _) ->
                    let 
                        newe = if e2_ /= e then e2_ else e_
                        news = if s2_ /= s then s2_ else s1_
                    in
                        {
                            store = res.store,
                            holeBindings = res.holeBindings,
                            riStmts = res.riStmts,
                            stmt = SWhile ws newe news,
                            hcount = res.hcount
                            , funcEnv = res.funcEnv
                        }
                _ -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "Error: unexecStmt: SWhile: unexpected statement"}
        SFuncDef _ _ _ _ ->
            { defaultUnexecRes | funcEnv = funcEnv, stmt = SError "function definition is not allowed during execution" }
        SFuncCall ws name args ->
            unexecFuncCall funcEnv store holeBindings riStmts readOnly hcount scount (newstore, newriStmts) ws name args
        SError s -> { defaultUnexecRes | funcEnv = funcEnv, stmt = SError s}

tryupde2logic : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde2logic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op = 
    let 
        (newv1, newv2) =
            case v of
                VHole _ _ -> 
                    case ((v1, v2, val), op) of
                        -- ((VHole _ _, VBool True, VBool True), "&&") -> (VBool True, VBool True)
                        ((VBool True, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)
                        -- ((VHole _ _, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)

                        ((VHole _ _, VBool True, VBool False), "&&") -> (v1, VBool False)
                        ((VBool True, VHole _ _, VBool False), "&&") -> (VBool True, VBool False)
                        ((VHole _ _, VHole _ _, VBool False), "&&") -> (v1, VBool False)

                        -- ((VHole _ _, VBool False, VBool False), "||") -> (v1, VBool False)
                        ((VBool False, VHole _ _, VBool False), "||") -> (VBool False, VBool False)
                        -- ((VHole _ _, VHole _ _, VBool False), "||") -> (v1, VBool False)

                        ((VHole _ _, VBool False, VBool True), "||") -> (v1, VBool True)
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
                                        (VBool True, VBool True) -> (VBool True, VBool False)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                "||" -> 
                                    case (v1, v2) of
                                        -- (VBool True, VBool True) -> (VError "unsupported operation", VError "unsupported operation")
                                        -- (VBool True, VBool False) -> (VError "unsupported operation", VError "unsupported operation")
                                        (VBool False, VBool True) -> (VBool False, VBool False)
                                        -- (VHole _ _, VBool True) -> (VError "unsupported operation", VError "unsupported operation")
                                        -- (VBool True, VHole _ _) -> (VError "unsupported operation", VError "unsupported operation")
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
                                        -- (VBool False, VBool False) -> (VError "unsupported operation", VError "unsupported operation")
                                        -- (VBool False, VBool True) -> (VError "unsupported operation", VError "unsupported operation")
                                        (VBool True, VBool False) -> (VBool True, VBool True)
                                        -- (VHole _ _, VBool True) -> (VError "unsupported operation", VError "unsupported operation")
                                        (VBool True, VHole _ _) -> (VBool True, VBool True)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                "||" -> 
                                    case (v1, v2) of
                                        (VBool False, VBool False) -> (VBool False, VBool True)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        VHole h _ -> (v1, val)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                _ -> (VError "unsupported operation", VError "unsupported operation")
    in
        case (newv1, newv2) of
            (VError s, VError _) -> ([], [], (EError ("logic: " ++ s), 0))
            _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op   

tryupde1logic : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde1logic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op = 
    let 
        (newv1, newv2) =
            case v of
                VHole _ _ -> 
                    case ((v1, v2, val), op) of
                        ((VHole _ _, VBool True, VBool True), "&&") -> (VBool True, VBool True)
                        -- ((VBool True, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)
                        -- ((VHole _ _, VHole _ _, VBool True), "&&") -> (VBool True, VBool True)

                        ((VHole _ _, VBool True, VBool False), "&&") -> (VBool False, VBool True)
                        ((VBool True, VHole _ _, VBool False), "&&") -> (VBool False, v2)
                        ((VHole _ _, VHole _ _, VBool False), "&&") -> (VBool False, v2)

                        ((VHole _ _, VBool False, VBool False), "||") -> (VBool False, VBool False)
                        -- ((VBool False, VHole _ _, VBool False), "||") -> (VBool False, VBool False)
                        -- ((VHole _ _, VHole _ _, VBool False), "||") -> (VBool False, VBool False)

                        ((VHole _ _, VBool False, VBool True), "||") -> (VBool True, VBool False)
                        ((VBool False, VHole _ _, VBool True), "||") -> (VBool True, v2)
                        ((VHole _ _, VHole _ _, VBool True), "||") -> (VBool True, v2)

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
                                        -- (VBool True, VBool True) -> (VBool False, VBool False)
                                        (VBool True, VBool False) -> (VBool False, VBool False)
                                        -- (VBool False, VBool True) -> (VBool False, VBool False)
                                        (VHole _ _, VBool True) -> (VBool False, VBool False)
                                        -- (VBool True, VHole _ _) -> (VBool False, VBool False)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        VHole h _ -> (val, v2)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                VBool False ->
                    case val of
                        VBool False -> (v1, v2)
                        VBool True ->
                            case op of
                                "&&" -> 
                                    case (v1, v2) of
                                        -- (VBool False, VBool False) -> (VBool True, VBool True)
                                        (VBool False, VBool True) -> (VBool True, VBool True)
                                        -- (VBool True, VBool False) -> (VBool True, VBool True)
                                        (VHole _ _, VBool True) -> (VBool True, VBool True)
                                        -- (VBool True, VHole _ _) -> (VBool True, VBool True)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                "||" -> 
                                    case (v1, v2) of
                                        (VBool False, VBool False) -> (VBool True, VBool False)
                                        _ -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        VHole h _ -> (val, v2)
                        _ -> (VError "unsupported operation", VError "unsupported operation")
                _ -> (VError "unsupported operation", VError "unsupported operation")
    in
    case (newv1, newv2) of
        (VError s, VError _) -> ([], [], (EError ("logic: " ++ s), 0))
        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op

tryupdelogic : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupdelogic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
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
        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op

logic : WS -> Expr -> Expr -> HoleBindings -> Store -> Set String -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
logic ws e1 e2 holeBindings store readOnly val hcount op =
    let v1 = eval store holeBindings e1 in
    let v2 = eval store holeBindings e2 in
    let v = eval store holeBindings (Eop ws op e1 e2) in
    if v == val then (store, holeBindings, (Eop ws op e1 e2, hcount))
    else
        let (estore, eholeBindings, (eexpr, ehcount)) = tryupdelogic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
        case eexpr of
            EError _ ->
                let (e1store, e1holeBindings, (e1expr, e1hcount)) = tryupde1logic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                case e1expr of
                    EError _ -> 
                        let (e2store, e2holeBindings, (e2expr, e2hcount)) = tryupde2logic ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                        case e2expr of
                            EError _ -> ([], [], (EError "error: uneval: both branches error", 0))
                            _ -> (e2store, e2holeBindings, (e2expr, e2hcount))
                    _ -> (e1store, e1holeBindings, (e1expr, e1hcount))
            _ -> (estore, eholeBindings, (eexpr, ehcount))

tryupdearith : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupdearith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e2 readOnly val hcount in
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
                _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
        VList vs ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, VHole _ _) ->
                                    (VList vs, VList [])
                                (VList vs1, VHole _ _) ->
                                    if List.length vs1 <= List.length vs && List.take (List.length vs1) vs == vs1 then
                                        (v1, VList (List.drop (List.length vs1) vs))
                                    else
                                        (VList vs, VList [])
                                (VHole _ _, VList vs2) ->
                                    if List.length vs2 <= List.length vs && List.drop (List.length vs - List.length vs2) vs == vs2 then
                                        (VList (List.take (List.length vs - List.length vs2) vs), v2)
                                    else
                                        (VList vs, VList [])
                                (VList vs1, VList vs2) ->
                                    let (vs1_, vs2_) = if (List.length vs1) > (List.length vs) then (vs, []) else (List.take (List.length vs1) vs, List.drop (List.length vs1) vs)
                                    in
                                    (VList vs1_, VList vs2_)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for list"), 0))
        VString s ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, VHole _ _) ->
                                    (VString s, VString "")
                                (VString s1, VHole _ _) ->
                                    if String.length s1 <= String.length s && String.left (String.length s1) s == s1 then
                                        (v1, VString (String.dropLeft (String.length s1) s))
                                    else
                                        (VString s, VString "")
                                (VHole _ _, VString s2) ->
                                    if String.length s2 <= String.length s && String.right (String.length s2) s == s2 then
                                        (VString (String.dropRight (String.length s2) s), v2)
                                    else
                                        (VString s, VString "")
                                (VString s1, VString _) ->
                                    let (s1_, s2_) = if (String.length s1) > (String.length s) then (s, "") else (String.left (String.length s1) s, String.dropLeft (String.length s1) s)
                                    in
                                    (VString s1_, VString s2_)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        _ -> ([], [], (EError ("arith: unsupported operation"), 0))

tryupde1arith : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde1arith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e1 readOnly val hcount in
                            (store_, holeBindings_, (Eop ws op expr_ e2, hcount_))
        VInt n ->
            let 
                (newv1, newv2) =
                    case (v1, v2) of
                        (_, VInt n2) ->
                            case op of  
                                "+" -> (VInt (n - n2), VInt n2)
                                "-" -> (VInt (n + n2), VInt n2)
                                "*" -> (VInt (n // n2), VInt n2)
                                "/" -> (VInt (n * n2), VInt n2)
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        _ -> (VError "unsupported operation", VError "unsupported operation")
            in
            case (newv1, newv2) of
                (VError _, VError _) -> ([], [], (EError ("arith: " ++ op), 0))
                _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
        VString s ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                -- (VHole _ _, VHole _ _) -> (VString "", VString s)
                                -- (VString s1, VHole _ _) -> 
                                --     let (s1_, s2_) = if (String.length s1) > (String.length s) then (s, "") else (String.left (String.length s1) s, String.dropLeft (String.length s1) s)
                                --     in
                                --     (VString s1_, VString s2_)
                                (_, VString s2) ->
                                    if String.length s2 > String.length s then (VError "unsupported operation", VError "unsupported operation")
                                    else
                                        let newv = String.right (String.length s2) s in
                                        if newv == s2 then (VString (String.dropRight (String.length s2) s), v2) else (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        VList vs ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                -- (VHole _ _, VHole _ _) -> (VList [], VList vs)
                                -- (VList vs1, VHole _ _) -> 
                                --     let (vs1_, vs2_) = if (List.length vs1) > (List.length vs) then (vs, []) else (List.take (List.length vs1) vs, List.drop (List.length vs1) vs)
                                --     in
                                --     (VList vs1_, VList vs2_)
                                (_, VList vs2) ->
                                    if List.length vs2 > List.length vs then (VError "unsupported operation", VError "unsupported operation")
                                    else
                                        let newv = List.take (List.length vs2) vs in
                                        if newv == vs2 then (VList (List.drop (List.length vs2) vs), v2) else (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        _ -> ([], [], (EError ("arith: unsupported operation"), 0))

tryupde2arith : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde2arith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e2 readOnly val hcount in
                            (store_, holeBindings_, (Eop ws op e1 expr_, hcount_))
        VInt n ->
            let 
                (newv1, newv2) =
                    case (v1, v2) of
                        (VInt n1, _) ->
                            case op of
                                "+" -> (VInt n1, VInt (n - n1))
                                "-" -> (VInt n1, VInt (n1 - n))
                                "*" -> (VInt n1, VInt (n1 * n))
                                "/" -> (VInt n1, VInt (n1 // n))
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                        _ -> (VError "unsupported operation", VError "unsupported operation")
            in
            case (newv1, newv2) of
                (VError _, VError _) -> ([], [], (EError ("arith: " ++ op), 0))
                _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
        VString s ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VString s1, _) ->
                                    if String.length s1 > String.length s then (VError "unsupported operation", VError "unsupported operation")
                                    else
                                        let newv = String.left (String.length s1) s in
                                        if newv == s1 then (v1, VString (String.dropLeft (String.length s1) s)) else (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        VList vs ->
            case op of
                "++"->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VList vs1, _) ->
                                    if List.length vs1 > List.length vs then (VError "unsupported operation", VError "unsupported operation")
                                    else
                                        let newv = List.take (List.length vs1) vs in
                                        if newv == vs1 then (v1, VList (List.drop (List.length vs1) vs)) else (VError "unsupported operation", VError "unsupported operation")
                                _ -> (VError "unsupported operation", VError "unsupported operation")
                    in
                    case (newv1, newv2) of
                        (VError info, VError _) -> ([], [], (EError ("arith: " ++ info), 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ -> ([], [], (EError ("arith: unsupported operation for string"), 0))
        _ -> ([], [], (EError ("arith: unsupported operation"), 0))


arith : WS -> Expr -> Expr -> HoleBindings -> Store -> Set String -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
arith ws e1 e2 holeBindings store readOnly val hcount op =
    let v1 = eval store holeBindings e1 in
    let v2 = eval store holeBindings e2 in
    let v = eval store holeBindings (Eop ws op e1 e2) in
    if v == val then (store, holeBindings, (Eop ws op e1 e2, hcount))
    else
        let (estore, eholeBindings, (eexpr, ehcount)) = tryupdearith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
        case eexpr of
            EError _ ->
                let (e1store, e1holeBindings, (e1expr, e1hcount)) = tryupde1arith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                case e1expr of
                    EError _ -> 
                        let (e2store, e2holeBindings, (e2expr, e2hcount)) = tryupde2arith ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                        case e2expr of
                            EError _ -> ([], [], (EError "error: uneval: both branches error", 0))
                            _ -> (e2store, e2holeBindings, (e2expr, e2hcount))
                    _ -> (e1store, e1holeBindings, (e1expr, e1hcount))
            _ -> (estore, eholeBindings, (eexpr, ehcount))
    
tryupdecomp : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupdecomp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e2 readOnly val hcount in
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
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                "!=" -> 
                    case (v1, v2) of
                        (VHole _ _, VHole _ _) -> ([], [], (EError "Cannot infer in neq", 0)) 
                        (VHole _ _, _) -> ([], [], (EError "Cannot infer in neq", 0))
                        (_, VHole _ _) -> ([], [], (EError "Cannot infer in neq", 0))
                        _ -> if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in neq", 0))
                _ ->
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
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ ->
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


tryupde1comp : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde1comp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e1 readOnly val hcount in
                            (store_, holeBindings_, (Eop ws op expr_ e2, hcount_))
        VBool True ->
            case op of
                "==" -> 
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (_, VHole _ _) -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (v2, v2)
                    in
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                "!=" -> 
                    if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in neq", 0))
                _ ->
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
                    if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in eq", 0))
                "!=" ->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (_, VHole _ _) -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (v2, v2)
                    in 
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ ->
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



tryupde2comp : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
tryupde2comp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op =
    case val of
        VHole _ _ -> 
            case v1 of
                VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                _ ->
                    case v2 of
                        VHole _ _ -> (store, holeBindings, (Eop ws op e1 e2, hcount))
                        _ ->
                            let (store_, holeBindings_, (expr_, hcount_)) = uneval store holeBindings e2 readOnly val hcount in
                            (store_, holeBindings_, (Eop ws op e1 expr_, hcount_))
        VBool True ->
            case op of
                "==" -> 
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (VHole _ _, _) -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (v1, v1)
                    in
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                "!=" -> 
                    if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in neq", 0))
                _ ->
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
                    if v1 /= v2 then (store, holeBindings, (Eop ws op e1 e2, hcount)) else ([], [], (EError "Cannot infer in eq", 0))
                "!=" ->
                    let 
                        (newv1, newv2) =
                            case (v1, v2) of
                                (_, VHole _ _) -> (VError "unsupported operation", VError "unsupported operation")
                                _ -> (v1, v1)
                    in 
                    case (newv1, newv2) of
                        (VError _, VError _) -> ([], [], (EError "unsupported operation", 0))
                        _ -> checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op
                _ ->
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


comp : WS -> Expr -> Expr -> HoleBindings -> Store -> Set String -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
comp ws e1 e2 holeBindings store readOnly val hcount op =
    let v1 = eval store holeBindings e1 in
    let v2 = eval store holeBindings e2 in
    let v = eval store holeBindings (Eop ws op e1 e2) in
    if v == val then (store, holeBindings, (Eop ws op e1 e2, hcount))
    else
        let (estore, eholeBindings, (eexpr, ehcount)) = tryupdecomp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
        case eexpr of
            EError _ ->
                let (e1store, e1holeBindings, (e1expr, e1hcount)) = tryupde1comp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                case e1expr of
                    EError _ -> 
                        let (e2store, e2holeBindings, (e2expr, e2hcount)) = tryupde2comp ws store holeBindings readOnly e1 e2 v1 v2 v val hcount op in
                        case e2expr of
                            EError _ -> ([], [], (EError "error: uneval: both branches error", 0))
                            _ -> (e2store, e2holeBindings, (e2expr, e2hcount))
                    _ -> (e1store, e1holeBindings, (e1expr, e1hcount))
            _ -> (estore, eholeBindings, (eexpr, ehcount))
    

exprOk : Expr -> Bool
exprOk e =
    case e of
        EError _ ->
            False

        _ ->
            True


checkChange : WS -> Store -> HoleBindings -> Set String -> Expr -> Expr -> Value -> Value -> Value -> Value -> HCount -> String -> (Store, HoleBindings, (Expr, HCount))
checkChange ws store holeBindings readOnly e1 e2 v1 v2 newv1 newv2 hcount op =
    if newv1 == v1 && newv2 == v2 then
        (store, holeBindings, (Eop ws op e1 e2, hcount))
    else
        let
            leftChanged =
                newv1 /= v1

            rightChanged =
                newv2 /= v2

            (store1, holeBindings1, (expr1, hcount1)) =
                if leftChanged then
                    uneval store holeBindings e1 readOnly newv1 hcount
                else
                    (store, holeBindings, (e1, hcount))

            (store2, holeBindings2, (expr2, hcount2)) =
                if rightChanged then
                    uneval store holeBindings e2 readOnly newv2 hcount1
                else
                    (store, holeBindings, (e2, hcount1))

            ok1 =
                exprOk expr1

            ok2 =
                exprOk expr2

            both =
                ( mergeStore store1 store2 store
                , mergeHoleBindings holeBindings1 holeBindings2 holeBindings
                , (Eop ws op expr1 expr2, hcount2)
                )

            leftOnly =
                (store1, holeBindings1, (Eop ws op expr1 e2, hcount1))

            rightOnly =
                (store2, holeBindings2, (Eop ws op e1 expr2, hcount2))

            fail =
                ([], [], (EError "error: uneval: operand update failed", 0))
        in
        if leftChanged && rightChanged then
            if ok1 && ok2 then
                both
            else if ok1 then
                leftOnly
            else
                rightOnly
        else if leftChanged then
            if ok1 then
                leftOnly
            else
                fail
        else if ok2 then
            rightOnly
        else
            fail 
mergeValue : Value -> Value -> Value -> Value
mergeValue orig v1 v2 =
    case (orig, v1, v2) of
        (VList os, VList vs1, VList vs2) ->
            VList (mergeList os vs1 vs2)

        _ ->
            if v1 /= orig then
                v1
            else
                v2


mergeList : List Value -> List Value -> List Value -> List Value
mergeList os vs1 vs2 =
    case (os, vs1, vs2) of
        (o :: os_, a :: as_, b :: bs_) ->
            mergeValue o a b :: mergeList os_ as_ bs_

        _ ->
            if vs1 /= os then
                vs1
            else
                vs2


mergeStore : Store -> Store -> Store -> Store
mergeStore store1 store2 store3 =
    case (store1, store2, store3) of
        ([], [], _) ->
            []

        ([], _, _) ->
            store2

        (_, [], _) ->
            store1

        ((x1, v1) :: store1_, (_, v2) :: store2_, (_, v3) :: store3_) ->
            (x1, mergeValue v3 v1 v2) :: mergeStore store1_ store2_ store3_

        _ ->
            []

mergeHoleBindings : HoleBindings -> HoleBindings -> HoleBindings -> HoleBindings
mergeHoleBindings hb1 hb2 hb =
    case hb of
        (hn, store, v) :: hb_ ->
            let
                (v1, hb1_) =
                    getElem hn store hb1

                (v2, hb2_) =
                    getElem hn store hb2

                newE1 =
                    (hn, store, v1)

                newE2 =
                    (hn, store, v2)

                resMerge = 
                    mergeHoleBindings hb1_ hb2_ hb_
            in
            case v1 of
                VError _ ->
                    newE2 :: resMerge
                _ ->
                    case v2 of
                        VError _ ->
                            if v1 /= v then
                                newE1 :: resMerge
                            else
                                (hn, store, v) :: resMerge
                        _ ->
                            (hn, store, mergeValue v v1 v2) :: resMerge

        [] -> union hb1 hb2

getElem : HoleName -> Store -> HoleBindings -> (Value, HoleBindings)
getElem hn store hb =
    case hb of
        (hn_, store_, v_) :: hb_ -> 
            if hn == hn_ && isSameStore store store_ then (v_, hb_) else 
                let (resv, reshb) = getElem hn store hb_ in
                (resv, (hn_, store_, v_) :: reshb)
        [] -> (VError "No such hole", hb)

union : HoleBindings -> HoleBindings -> HoleBindings
union hb1 hb2 =
    case hb2 of
        (hn2, store2, v2)::hb2_ ->
            if elemIn hn2 store2 hb1 then
                union hb1 hb2_
            else
                (hn2, store2, v2)::(union hb1 hb2_)

        _ -> hb1

elemIn : HoleName -> Store -> HoleBindings -> Bool
elemIn hn store hb =
    case hb of
        (hn_, store_, _)::hb_ -> if hn == hn_ && isSameStore store store_ then True else elemIn hn store hb_
        _ -> False

getFinalRiStmtStore : RiStmts -> Store
getFinalRiStmtStore riStmts =
    case riStmts of
        (_, _, store) :: [] -> store
        _ :: rest -> getFinalRiStmtStore rest
        _ -> []

unpollute : Store -> Store -> SCount -> Store
unpollute store oristore scount =
    case store of
        ("output", VList vs) :: store_ ->
            let 
                output_ = 
                    case List.reverse vs of
                        (VHole (HVar "output") id) :: _ -> 
                            if id == scount then 
                                let oriv = lookup "output" oristore in
                                case oriv of
                                    Just v -> v
                                    Nothing -> VError "unsupported operation"
                            else VList vs
                        _ -> VList vs
            in
            ("output", output_) :: (unpollute store_ oristore scount)
        (x, VHole (HVar x_) id) :: store_ -> 
            if x_ == x && id == scount then 
                case lookup x oristore of
                    Just v -> (x, v) :: (unpollute store_ oristore scount)
                    Nothing -> unpollute store_ oristore scount
            else (x, VHole (HVar x_) id) :: (unpollute store_ oristore scount)
        (x, v) :: store_ -> (x, v) :: (unpollute store_ oristore scount)
        _ -> []

-- unpolluteIO : IO -> IO -> SCount -> IO
-- unpolluteIO io oriio scount =
--     let input = getIO io "input" in
--     let output = getIO io "output" in
--     let 
--         newinput = 
--             case input of
--                 [VHole (HVar "input") id] -> 
--                     if id == scount then getIO oriio "input" else input
--                 _ -> input
--         newoutput = 
--             case List.reverse output of
--                 (VHole (HVar "output") id) :: _ -> 
--                     if id == scount then getIO oriio "output" else output
--                 _ -> output
--     in
--     [("input", newinput), ("output", newoutput)]

writeIndexValue : Value -> Value -> Value -> Value
writeIndexValue path xv val =
    case path of
        VList [] ->
            val
        VList [ VInt i ] ->
            case xv of
                VList vs ->
                    if i >= 0 && i < List.length vs then
                        updateValue path xv val
                    else
                        VError "index out of range"
                VString s ->
                    if i >= 0 && i < String.length s then
                        case val of
                            VString s_ ->
                                if String.length s_ == 1 then
                                    VString (String.left i s ++ s_ ++ String.dropLeft (i + 1) s)
                                else
                                    VError "index out of range or string length not 1"
                            VHole _ _ ->
                                val
                            _ ->
                                VError "unsupported expression"
                    else
                        VError "index out of range"
                VHole _ _ ->
                    xv
                _ ->
                    VError "unsupported expression"
        VList (VInt i :: rest) ->
            case xv of
                VList vs ->
                    if i >= 0 && i < List.length vs then
                        let inner_ = writeIndexValue (VList rest) (nthValue vs i) val in
                        case inner_ of
                            VError s ->
                                VError s
                            _ ->
                                updateValue (VList [ VInt i ]) xv inner_
                    else
                        VError "index out of range"
                VHole _ _ ->
                    xv
                _ ->
                    VError "unsupported expression"
        _ ->
            VError "unsupported expression"
