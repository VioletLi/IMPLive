module IMP.Eval exposing (..)

import IMP.Syntax exposing (..)
import IMP.Utils exposing (..)
import Dict exposing (Dict)
import Set exposing (Set)

type alias FwdRes = 
    {
        store : Store,
        riStmts : RiStmts,
        scount : SCount,
        readOnly : Set String
    }

defaultFwdRes : FwdRes
defaultFwdRes = {store = [], riStmts = [], scount = 0, readOnly = Set.empty}

eraseHoleName : Value -> Value
eraseHoleName v =
    case v of
        VHole _ _ ->
            VHole HTmp -1

        _ ->
            v


eval : Store -> HoleBindings -> Expr -> Value
eval store holeBindings expr =
    eraseHoleName (evalCore store holeBindings expr)


evalCore : Store -> HoleBindings -> Expr -> Value
evalCore store holeBindings expr =
    case expr of
        EVar _ x -> 
            case lookup x store of
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
        EParens ws e -> eval store holeBindings e
        ENot ws e -> 
            let v = eval store holeBindings e in
            case v of
                VBool b -> VBool (not b)
                VHole _ _ -> VHole HTmp -1
                _ -> VError "Unsupported expression"
        EList ws es ->
            VList (List.map (eval store holeBindings) es)
        EIndex ws e1 e2 ->
            let v1 = eval store holeBindings e1 in
            let v2 = eval store holeBindings e2 in
            case v1 of
                VString s -> 
                    case v2 of
                        VInt i -> VString (String.slice i (i+1) s)
                        VHole _ _ -> VHole HTmp -1
                        _ -> VError "Unsupported expression"
                VList vs ->
                    case v2 of
                        VInt i -> 
                            if i >= 0 && i < List.length vs then
                                nthValue vs i
                            else
                                VError "Index out of range"
                        VHole _ _ -> VHole HTmp -1
                        _ -> VError "Unsupported expression"
                VHole _ _ -> VHole HTmp -1
                _ -> VError "Unsupported expression"
        ELength ws e ->
            let v = eval store holeBindings e in
            case v of
                VString s -> VInt (String.length s)
                VList vs -> VInt (List.length vs)
                VHole _ _ -> VHole HTmp -1
                _ -> VError "Unsupported expression"
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
                (VList vs1, VList vs2) -> VList (vs1 ++ vs2)
                (VHole _ _, _) -> VHole HTmp -1
                (_, VHole _ _) -> VHole HTmp -1
                _ -> VError "Unsupported operation"
        _ -> VError "Unsupported operation"

simplifyExpr : Store -> Expr -> HoleBindings -> Expr
simplifyExpr store e holeBindings =
    case e of
        EVar _ x ->
            case lookup x store of
                Just (VHole _ _) ->
                    EVar [] x

                Just v ->
                    value2Expr v

                Nothing ->
                    EError "Variable not found"

        EIndex _ e1 e2 ->
            let
                e1_ =
                    simplifyLhs store e1 holeBindings

                e2_ =
                    simplifyExpr store e2 holeBindings

                v1 =
                    eval store holeBindings e1_

                v2 =
                    eval store holeBindings e2_
            in
            case ( v1, v2 ) of
                ( VList vs, VInt i ) ->
                    if i >= 0 && i < List.length vs then
                        case nthValue vs i of
                            VHole _ _ ->
                                EIndex [] e1_ e2_

                            v ->
                                value2Expr v

                    else
                        EError "Index out of range"

                ( VString s, VInt i ) ->
                    if i >= 0 && i < String.length s then
                        value2Expr (VString (String.slice i (i + 1) s))

                    else
                        EError "Index out of range"

                _ ->
                    EIndex [] e1_ e2_

        Eop ws op e1 e2 ->
            Eop ws op (simplifyExpr store e1 holeBindings) (simplifyExpr store e2 holeBindings)

        ENot ws e1 ->
            ENot ws (simplifyExpr store e1 holeBindings)

        EParens _ e1 ->
            simplifyExpr store e1 holeBindings

        EList ws es ->
            EList ws (List.map (\e_ -> simplifyExpr store e_ holeBindings) es)

        ELength ws e1 ->
            ELength ws (simplifyExpr store e1 holeBindings)

        _ ->
            e

simplifyLhs : Store -> Expr -> HoleBindings -> Expr
simplifyLhs store e holeBindings =
    case e of
        EVar _ x ->
            EVar [] x

        EIndex _ e1 e2 ->
            EIndex [] (simplifyLhs store e1 holeBindings) (simplifyExpr store e2 holeBindings)

        _ ->
            e


foldRiStmts : HoleBindings -> RiStmts -> RiStmts
foldRiStmts hb ris =
    List.map
        (\( id, s, store ) -> ( id, foldResidualStmt store hb s, store ))
        ris


foldResidualStmt : Store -> HoleBindings -> Stmt -> Stmt
foldResidualStmt store hb s =
    case s of
        SAssign ws e1 e2 ->
            SAssign ws (foldResidualLhs store hb e1) (foldResidualExpr store hb e2)

        SIf ws e s1 s2 ->
            SIf ws (foldResidualExpr store hb e) s1 s2

        SWhile ws e body ->
            SWhile ws (foldResidualExpr store hb e) body

        SPrint ws e ->
            SPrint ws (foldResidualExpr store hb e)

        SSeq ws s1 s2 ->
            SSeq ws (foldResidualStmt store hb s1) (foldResidualStmt store hb s2)

        SFuncCall ws name args ->
            SFuncCall ws name (List.map (foldResidualExpr store hb) args)

        _ ->
            s


foldResidualLhs : Store -> HoleBindings -> Expr -> Expr
foldResidualLhs store hb e =
    case e of
        EVar _ _ ->
            e

        EIndex ws e1 e2 ->
            EIndex ws (foldResidualLhs store hb e1) (foldResidualExpr store hb e2)

        _ ->
            foldResidualExpr store hb e


foldResidualExpr : Store -> HoleBindings -> Expr -> Expr
foldResidualExpr store hb e =
    case e of
        EVar _ _ ->
            e

        EInt _ _ ->
            e

        EBool _ _ ->
            e

        EString _ _ ->
            e

        EHole _ h ->
            case lookupHB h store hb of
                Just v ->
                    if isFullyDet v then
                        value2Expr v

                    else
                        e

                Nothing ->
                    e

        Eop ws op e1 e2 ->
            foldIfDet store hb (Eop ws op (foldResidualExpr store hb e1) (foldResidualExpr store hb e2))

        EIndex ws e1 e2 ->
            foldIfDet store hb (EIndex ws (foldResidualExpr store hb e1) (foldResidualExpr store hb e2))

        ELength ws e1 ->
            foldIfDet store hb (ELength ws (foldResidualExpr store hb e1))

        ENot ws e1 ->
            foldIfDet store hb (ENot ws (foldResidualExpr store hb e1))

        EParens _ e1 ->
            foldResidualExpr store hb e1

        EList ws es ->
            EList ws (List.map (foldResidualExpr store hb) es)

        _ ->
            e


foldIfDet : Store -> HoleBindings -> Expr -> Expr
foldIfDet store hb e =
    let
        v =
            eval store hb e
    in
    if isFullyDet v then
        value2Expr v

    else
        e


restoreReadOnly : List String -> Set String -> Set String -> Set String
restoreReadOnly params before after =
    Set.union
        (List.foldl Set.remove after params)
        (Set.intersect before (Set.fromList params))


type alias ParamBind =
    { param : String
    , arg : Expr
    , scount : SCount
    }


bindParamsParallel : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> SCount -> List String -> List Expr -> ( FwdRes, List ParamBind )
bindParamsParallel funcEnv evalStore holeBindings riStmts readOnly scount params args =
    case ( params, args ) of
        ( [], [] ) ->
            ( { store = evalStore, riStmts = riStmts, scount = scount, readOnly = readOnly }, [] )

        ( p :: ps, e :: es ) ->
            let
                res =
                    exec funcEnv evalStore holeBindings riStmts (SAssign [] (EVar [] p) e) readOnly scount
            in
            if isErrorStore res.store then
                ( res, [] )

            else
                let
                    ( rest, steps ) =
                        bindParamsParallel funcEnv evalStore holeBindings res.riStmts readOnly res.scount ps es
                in
                if isErrorStore rest.store then
                    ( rest, [] )

                else
                    ( { rest | store = overlayParams [ p ] res.store rest.store }
                    , { param = p, arg = e, scount = scount } :: steps
                    )

        _ ->
            ( { defaultFwdRes | store = [ ( "error", VError "Argument count mismatch" ) ] }, [] )


execFuncCall : FuncEnv -> Store -> HoleBindings -> RiStmts -> Set String -> SCount -> String -> List Expr -> FwdRes
execFuncCall funcEnv store holeBindings riStmts readOnly scount name args =
    case lookupFunc name funcEnv of
        Nothing ->
            { defaultFwdRes | store = [ ( "error", VError "Function not found" ) ] }

        Just ( params, body ) ->
            if List.length params /= List.length args then
                { defaultFwdRes | store = [ ( "error", VError "Argument count mismatch" ) ] }

            else
                let
                    saved =
                        snapshotParams params store

                    readOnlyBound =
                        List.foldl Set.remove readOnly params

                    ( bound, _ ) =
                        bindParamsParallel funcEnv store holeBindings riStmts readOnlyBound scount params args
                in
                if isErrorStore bound.store then
                    bound

                else
                    let
                        res =
                            exec funcEnv bound.store holeBindings bound.riStmts body bound.readOnly bound.scount
                    in
                    if isErrorStore res.store then
                        res

                    else
                        { res
                            | store = restoreParams saved res.store
                            , readOnly = restoreReadOnly params readOnly res.readOnly
                        }


exec : FuncEnv -> Store -> HoleBindings -> RiStmts -> Stmt -> Set String -> SCount -> FwdRes
exec funcEnv store holeBindings riStmts stmt readOnly scount =
    case stmt of
        SSkip _ -> {store = store, riStmts = riStmts, readOnly = readOnly, scount = scount}
        SAssign _ e1 e2 ->
            let
                v = eval store holeBindings e2
            in
            case e1 of
                EVar _ x ->
                    let newReadOnly = if Set.member x readOnly then Set.remove x readOnly else readOnly in
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e2 holeBindings in
                            { store = updateStore x (VHole (HVar x) scount) store
                            , riStmts = riStmts ++ [(scount, SAssign [] e1 e_, store)]
                            , readOnly = newReadOnly
                            , scount = scount+1}
                        VError _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
                        VList vs ->
                            if hasHole vs then
                                let resv = processHoleinList vs x scount (VList []) in
                                let rese = simplifyExpr store e2 holeBindings in
                                { store = updateStore x (VList resv) store
                                , riStmts = riStmts ++ [(scount, SAssign [] e1 rese, store)]
                                , readOnly = newReadOnly
                                , scount = scount+1}
                            else
                                { store = updateStore x (VList vs) store
                                , riStmts = riStmts
                                , readOnly = newReadOnly
                                , scount = scount}
                        _ ->
                            { store = updateStore x v store
                            , riStmts = riStmts
                            , readOnly = newReadOnly
                            , scount = scount}
                EIndex _ _ _ ->
                    -- 认为没有给某个下标赋值list的case
                    let
                        ( x, path ) =
                            findIndex store holeBindings e1

                        newReadOnly =
                            if Set.member x readOnly then
                                Set.remove x readOnly

                            else
                                readOnly

                        residualizeLoc =
                            let
                                e1_ =
                                    simplifyLhs store e1 holeBindings

                                e2_ =
                                    simplifyExpr store e2 holeBindings
                            in
                            { store = updateStore x (VHole (HVar x) scount) store
                            , riStmts = riStmts ++ [ ( scount, SAssign [] e1_ e2_, store ) ]
                            , readOnly = newReadOnly
                            , scount = scount + 1
                            }
                    in
                    case path of
                        VHole _ _ ->
                            residualizeLoc

                        VList p ->
                            case lookup x store of
                                Just (VList vs) ->
                                    case v of
                                        VHole _ _ ->
                                            let
                                                newv =
                                                    updateValue path (VList vs) (VHole (pathToName (HVar x) path) scount)

                                                e1_ =
                                                    simplifyLhs store e1 holeBindings

                                                e2_ =
                                                    simplifyExpr store e2 holeBindings
                                            in
                                            { store = updateStore x newv store
                                            , riStmts = riStmts ++ [ ( scount, SAssign [] e1_ e2_, store ) ]
                                            , readOnly = newReadOnly
                                            , scount = scount + 1
                                            }

                                        VList vs_ ->
                                            if hasHole vs_ then
                                                let
                                                    resv =
                                                        processHoleinList vs_ x scount path

                                                    e1_ =
                                                        simplifyLhs store e1 holeBindings

                                                    e2_ =
                                                        simplifyExpr store e2 holeBindings

                                                    newv =
                                                        updateValue path (VList vs) (VList resv)
                                                in
                                                { store = updateStore x newv store
                                                , riStmts = riStmts ++ [ ( scount, SAssign [] e1_ e2_, store ) ]
                                                , readOnly = newReadOnly
                                                , scount = scount + 1
                                                }

                                            else
                                                { store = updateStore x (updateValue path (VList vs) v) store
                                                , riStmts = riStmts
                                                , readOnly = newReadOnly
                                                , scount = scount
                                                }

                                        _ ->
                                            { store = updateStore x (updateValue path (VList vs) v) store
                                            , riStmts = riStmts
                                            , readOnly = newReadOnly
                                            , scount = scount
                                            }

                                _ ->
                                    residualizeLoc

                        _ ->
                            residualizeLoc
                _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
        SSeq _ s1 s2 -> 
            let
                res1 = exec funcEnv store holeBindings riStmts s1 readOnly scount
            in
            if isErrorStore res1.store then
                res1
            else
                exec funcEnv res1.store holeBindings res1.riStmts s2 res1.readOnly res1.scount
        SIf _ e s1 s2 -> 
            let
                v = eval store holeBindings e
            in
            case v of 
                VHole HTmp _ -> 
                    let
                    -- if和read这些对input和output的变量好像有冲突？
                        e_ = simplifyExpr store e holeBindings
                        mod = unique (modVars funcEnv s1 ++ (modVars funcEnv s2))
                        store_ = polluteState mod store scount
                    in
                    { store = store_
                    , riStmts = riStmts ++ [(scount, SIf [] e_ s1 s2, store)]
                    , readOnly = readOnly
                    , scount = scount + 1
                    }
                VBool True -> exec funcEnv store holeBindings riStmts s1 readOnly scount
                VBool False -> exec funcEnv store holeBindings riStmts s2 readOnly scount
                _ -> {defaultFwdRes|store=[("error", VError "Unsupported guard of If")]}
                
        SWhile _ e s -> 
            case eval store holeBindings e of
                VHole HTmp _ -> 
                    let 
                        e_ = simplifyExpr store e holeBindings
                        mod = unique (modVars funcEnv s) 
                        store_ = polluteState mod store scount
                    in
                    { store = store_    
                    , riStmts = riStmts ++ [(scount, SIf [] e_ (SSeq [] s (SWhile [] e s)) (SSkip []), store)]
                    , readOnly = readOnly
                    , scount = scount + 1
                    }
                VBool True -> exec funcEnv store holeBindings riStmts (SSeq [] s stmt) readOnly scount
                VBool False -> 
                    { store = store
                    , riStmts = riStmts
                    , readOnly = readOnly
                    , scount = scount}
                _ -> {defaultFwdRes | store = [("error", VError "Unsupported guard of While")]}
                
        SRead _ x ->
            let
                input = lookup "input" store
            in
            case input of
                Just (VList (v :: rest)) ->
                    let newstore = updateStore x v store in
                    { store = updateStore "input" (VList rest) newstore
                    , riStmts = riStmts
                    , readOnly = Set.insert x readOnly
                    , scount = scount}
                Just (VHole _ _) -> 
                    let newstore = updateStore x (VHole (HVar x) scount) store in
                    { store = updateStore "input" (VHole (HVar "input") scount) newstore
                    , riStmts = riStmts ++ [(scount, SRead [] x, store)]
                    , readOnly = Set.insert x readOnly
                    , scount = scount+1}
                _ -> {defaultFwdRes | store = [("error", VError "Input not found")]}
        SPrint _ e -> 
            let oldval = lookup "output" store in
            case eval store holeBindings e of
                VHole HTmp _ -> 
                    let
                        e_ = simplifyExpr store e holeBindings
                    in
                    case oldval of
                        Just (VList vs) -> 
                            { store = updateStore "output" (VList (vs ++ [VHole (pathToName (HVar "output") (VList [VInt (List.length vs)])) scount])) store
                            , riStmts = riStmts ++ [(scount, SPrint [] e_, store)]
                            , readOnly = readOnly
                            , scount = scount + 1
                            }
                        _ -> {defaultFwdRes | store = [("error", VError "Output not found")]}
                VError _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
                VList vs ->
                    if hasHole vs then
                        let e_ = simplifyExpr store e holeBindings in
                        case oldval of
                            Just (VList vs_) ->
                                let resv = processHoleinList vs "output" scount (VList [VInt (List.length vs_)]) in
                                { store = updateStore "output" (VList (vs_ ++ [VList resv])) store
                                , riStmts = riStmts ++ [(scount, SPrint [] e_, store)]
                                , readOnly = readOnly
                                , scount = scount + 1
                                }
                            _ -> {defaultFwdRes | store = [("error", VError "Output not found")]}
                    else
                        case oldval of
                            Just (VList vs_) ->
                                { store = updateStore "output" (VList (vs_ ++ [VList vs])) store
                                , riStmts = riStmts
                                , readOnly = readOnly
                                , scount = scount}
                            _ -> {defaultFwdRes | store = [("error", VError "Output not found")]}
                v ->
                    case oldval of
                        Just (VList vs) ->
                            { store = updateStore "output" (VList (vs ++ [v])) store
                            , riStmts = riStmts
                            , readOnly = readOnly
                            , scount = scount}
                        _ -> {defaultFwdRes | store = [("error", VError "Output not found")]}
        SFuncDef _ _ _ _ ->
            { defaultFwdRes | store = [ ( "error", VError "function definition is not allowed during execution" ) ] }
        SFuncCall _ name args ->
            execFuncCall funcEnv store holeBindings riStmts readOnly scount name args
        SError s -> {defaultFwdRes | store = [("error", VError s)]}

type alias AdvancedRes =
    { id : StmtID
    , stmt : Stmt
    , snapshot : Store
    , result : Store
    }


type alias ResumeOut =
    { completed : List ( StmtID, Store )
    , advanced : List AdvancedRes
    , remaining : RiStmts
    , scount : SCount
    }


emptyResume : SCount -> ResumeOut
emptyResume scount =
    { completed = []
    , advanced = []
    , remaining = []
    , scount = scount
    }


mergeResume : ResumeOut -> ResumeOut -> ResumeOut
mergeResume a b =
    { completed = a.completed ++ b.completed
    , advanced = a.advanced ++ b.advanced
    , remaining = a.remaining ++ b.remaining
    , scount = b.scount
    }


fill : FuncEnv -> HoleMap -> HoleBindings -> FwdRes -> FwdRes
fill funcEnv holes hb fwdRes =
    fillLoop funcEnv holes hb Set.empty fwdRes


fillLoop : FuncEnv -> HoleMap -> HoleBindings -> Set Int -> FwdRes -> FwdRes
fillLoop funcEnv holes hb dirty fwdRes =
    let
        ris0 =
            fwdRes.riStmts

-- 这里应该改成，先逐条检查ristmt，替换hole
        ris0_ = substHole holes ris0
-- 然后逐条执行，返回值是(id, [ristmt], store)
-- 

        ris1 =
            foldRiStmts hb (substHole holes ris0)

        resumed =
            resumeAll funcEnv hb (nextScount fwdRes.scount ris1) dirty ris0 ris1
    in
    if List.isEmpty resumed.completed && List.isEmpty resumed.advanced then
        reindexResiduals { fwdRes | riStmts = resumed.remaining }

    else
        let
            results =
                resumed.completed
                    ++ List.map (\a -> ( a.id, publishStore a.snapshot a.result )) resumed.advanced

            keep =
                resumed.remaining
                    ++ List.map (\a -> ( a.id, a.stmt, a.snapshot )) resumed.advanced

            ctx =
                { done = results
                , snaps =
                    keep
                        |> List.map (\( id, _, st ) -> ( id, st ))
                        |> Dict.fromList
                }

            ( store2, h2eMap1 ) =
                substHoleInStore fwdRes.store ctx Dict.empty

            ( keep2, h2eMap2 ) =
                substHoleInStmtStore keep ctx h2eMap1

            keep3 =
                foldRiStmts hb (substHole h2eMap2 keep2)
        in
        fillLoop funcEnv
            h2eMap2
            hb
            (changedStoreIds keep keep2)
            { fwdRes
                | store = writePrintOutput hb keep3 store2
                , riStmts = keep3
                , scount = resumed.scount
            }


isHoleOutput : Value -> Bool
isHoleOutput v =
    case v of
        VHole _ _ ->
            True

        VList [ VHole _ _ ] ->
            True

        _ ->
            False


writePrintOutput : HoleBindings -> RiStmts -> Store -> Store
writePrintOutput hb ris store =
    List.foldl
        (\( _, s, st ) acc ->
            case s of
                SPrint _ e ->
                    case eval st hb e of
                        VError _ ->
                            acc

                        VHole _ _ ->
                            acc

                        v ->
                            case lookup "output" acc of
                                Just ov ->
                                    if isHoleOutput ov then
                                        updateStore "output" (VList [ printRow v st ]) acc

                                    else
                                        acc

                                _ ->
                                    acc

                _ ->
                    acc
        )
        store
        ris


printRow : Value -> Store -> Value
printRow v st =
    case v of
        VList evs ->
            case namedHoleList evs st of
                Just vs ->
                    VList vs

                Nothing ->
                    v

        _ ->
            v


namedHoleList : List Value -> Store -> Maybe (List Value)
namedHoleList evs st =
    case st of
        ( x, VList bvs ) :: rest ->
            if x /= "output" && List.length bvs == List.length evs && hasHole bvs then
                Just bvs

            else
                namedHoleList evs rest

        _ :: rest ->
            namedHoleList evs rest

        [] ->
            Nothing


changedStoreIds : RiStmts -> RiStmts -> Set Int
changedStoreIds olds news =
    case ( olds, news ) of
        ( ( id, _, st0 ) :: os, ( _, _, st1 ) :: ns ) ->
            if st0 == st1 then
                changedStoreIds os ns

            else
                Set.insert id (changedStoreIds os ns)

        _ ->
            Set.empty


type alias CollectCtx =
    { done : List ( StmtID, Store )
    , snaps : Dict Int Store
    }


publishStore : Store -> Store -> Store
publishStore snapshot result =
    List.map
        (\( x, v ) ->
            case v of
                VHole _ _ ->
                    case lookup x snapshot of
                        Just sv ->
                            ( x, sv )

                        Nothing ->
                            ( x, v )

                _ ->
                    ( x, v )
        )
        result


isFullyDet : Value -> Bool
isFullyDet v =
    case v of
        VError _ ->
            False

        _ ->
            not (isIndet v)


nextScount : SCount -> RiStmts -> SCount
nextScount scount ris =
    List.foldl
        (\( id, _, _ ) acc ->
            if id + 1 > acc then
                id + 1

            else
                acc
        )
        scount
        ris


resumeAll : FuncEnv -> HoleBindings -> SCount -> Set Int -> RiStmts -> RiStmts -> ResumeOut
resumeAll funcEnv hb scount dirty oldRis newRis =
    case ( oldRis, newRis ) of
        ( [], [] ) ->
            emptyResume scount

        ( ( id, s0, store ) :: os, ( _, s1, _ ) :: ns ) ->
            let
                one =
                    resumeOne funcEnv hb scount dirty id s0 s1 store

                acc =
                    resumeAll funcEnv hb one.scount dirty os ns
            in
            mergeResume one acc

        _ ->
            emptyResume scount


resumeOne : FuncEnv -> HoleBindings -> SCount -> Set Int -> StmtID -> Stmt -> Stmt -> Store -> ResumeOut
resumeOne funcEnv hb scount dirty id s0 s1 store =
    let
        remain s_ =
            { completed = []
            , advanced = []
            , remaining = [ ( id, s_, store ) ]
            , scount = scount
            }

        fail =
            { completed = [ ( -2, [] ) ]
            , advanced = []
            , remaining = []
            , scount = scount
            }
    in
    if stmtEq s0 s1 && not (Set.member id dirty) then
        remain s1

    else
        let
            res =
                exec funcEnv store hb [] s1 Set.empty scount
        in
        if isErrorStore res.store then
            fail

        else if List.isEmpty res.riStmts then
            { completed = [ ( id, res.store ) ]
            , advanced = []
            , remaining = []
            , scount = res.scount
            }

        else
            case res.riStmts of
                [ ( newId, sNew, _ ) ] ->
                    let
                        mapId i =
                            if i == newId then
                                id

                            else
                                i

                        s2 =
                            reindexStmt mapId sNew

                        post =
                            reindexStore mapId res.store
                    in
                    if stmtEq s2 s1 then
                        remain s1

                    else
                        { completed = []
                        , advanced =
                            [ { id = id
                              , stmt = s2
                              , snapshot = store
                              , result = post
                              }
                            ]
                        , remaining = []
                        , scount = res.scount
                        }

                spawned ->
                    { completed = [ ( id, res.store ) ]
                    , advanced = []
                    , remaining = spawned
                    , scount = res.scount
                    }


stmtEq : Stmt -> Stmt -> Bool
stmtEq a b =
    case ( a, b ) of
        ( SAssign _ e1 e2, SAssign _ f1 f2 ) ->
            exprEq e1 f1 && exprEq e2 f2

        ( SIf _ e s1 s2, SIf _ f t1 t2 ) ->
            exprEq e f && stmtEq s1 t1 && stmtEq s2 t2

        ( SWhile _ e s1, SWhile _ f t1 ) ->
            exprEq e f && stmtEq s1 t1

        ( SRead _ x, SRead _ y ) ->
            x == y

        ( SPrint _ e, SPrint _ f ) ->
            exprEq e f

        ( SSeq _ s1 s2, SSeq _ t1 t2 ) ->
            stmtEq s1 t1 && stmtEq s2 t2

        ( SSkip _, SSkip _ ) ->
            True

        ( SFuncCall _ n1 a1, SFuncCall _ n2 a2 ) ->
            n1 == n2 && exprListEq a1 a2

        ( SError x, SError y ) ->
            x == y

        _ ->
            False


exprEq : Expr -> Expr -> Bool
exprEq a b =
    case ( a, b ) of
        ( EVar _ x, EVar _ y ) ->
            x == y

        ( EInt _ i, EInt _ j ) ->
            i == j

        ( EBool _ p, EBool _ q ) ->
            p == q

        ( EString _ s, EString _ t ) ->
            s == t

        ( EHole _ h1, EHole _ h2 ) ->
            h1 == h2

        ( Eop _ op1 e1 e2, Eop _ op2 f1 f2 ) ->
            op1 == op2 && exprEq e1 f1 && exprEq e2 f2

        ( ENot _ e1, ENot _ e2 ) ->
            exprEq e1 e2

        ( EParens _ e1, EParens _ e2 ) ->
            exprEq e1 e2

        ( EList _ es1, EList _ es2 ) ->
            exprListEq es1 es2

        ( EIndex _ e1 e2, EIndex _ f1 f2 ) ->
            exprEq e1 f1 && exprEq e2 f2

        ( ELength _ e1, ELength _ e2 ) ->
            exprEq e1 e2

        ( EError x, EError y ) ->
            x == y

        _ ->
            False


exprListEq : List Expr -> List Expr -> Bool
exprListEq a b =
    case ( a, b ) of
        ( [], [] ) ->
            True

        ( e1 :: r1, e2 :: r2 ) ->
            exprEq e1 e2 && exprListEq r1 r2

        _ ->
            False


substHoleInStmtStore : RiStmts -> CollectCtx -> HoleMap -> (RiStmts, HoleMap)
substHoleInStmtStore ris ctx h2eMap =
    case ris of
        [] -> ([], h2eMap)
        (id, s, store) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore store ctx h2eMap in
            let (resstmt, newh2eMap_) = substHoleInStmtStore rest ctx newh2eMap in
            -- let newio = substHoleInIO io execList in
            ((id, s, newstore)::resstmt, newh2eMap_)

holeDiff : Value -> Value -> HoleMap -> HoleMap
holeDiff old new acc =
    case (old, new) of
        (VHole h id, _) ->
            if old == new then
                acc
            else
                Dict.insert (valHoleKey h id) (value2Expr new) acc

        (VList os, VList ns) ->
            holeDiffList os ns acc

        _ ->
            acc


holeDiffList : List Value -> List Value -> HoleMap -> HoleMap
holeDiffList os ns acc =
    case (os, ns) of
        (o :: os_, n :: ns_) ->
            holeDiffList os_ ns_ (holeDiff o n acc)

        _ ->
            acc


exprToValue : Expr -> Value
exprToValue e =
    case e of
        EInt _ i ->
            VInt i

        EBool _ b ->
            VBool b

        EString _ s ->
            VString s

        EList _ es ->
            VList (List.map exprToValue es)

        EHole _ h ->
            VHole h -1

        _ ->
            eval [] [] e


substValByMap : HoleMap -> Value -> Value
substValByMap holes v =
    case v of
        VHole h id ->
            case Dict.get (valHoleKey h id) holes of
                Just e ->
                    exprToValue e

                Nothing ->
                    v

        VList vs ->
            VList (List.map (substValByMap holes) vs)

        _ ->
            v


substStoreByMap : HoleMap -> Store -> Store
substStoreByMap holes store =
    List.map (\(x, v) -> (x, substValByMap holes v)) store


patchRiVar : String -> Value -> RiStmts -> RiStmts
patchRiVar x v ris =
    List.map (\(id, s, store) -> (id, s, updateStore x v store)) ris


replaceOutputRow : Int -> Value -> Store -> Store
replaceOutputRow i row store =
    case lookup "output" store of
        Just (VList vs) ->
            if i >= 0 && i < List.length vs then
                updateStore "output" (VList (List.take i vs ++ [ row ] ++ List.drop (i + 1) vs)) store
            else if i == List.length vs then
                updateStore "output" (VList (vs ++ [ row ])) store
            else
                store

        _ ->
            store


processHoleinList : List Value -> String -> SCount -> Value -> List Value
processHoleinList vs x scount path =
    processHoleinListWalk vs x scount path 0

processHoleinListWalk : List Value -> String -> SCount -> Value -> Int -> List Value
processHoleinListWalk vs x scount path i =
    case vs of
        [] ->
            []

        v :: rest ->
            let
                path_ =
                    case path of
                        VList p ->
                            VList (p ++ [VInt i])

                        _ ->
                            VList [VInt i]
            in
            processHoleAt v x scount path_
                :: processHoleinListWalk rest x scount path (i + 1)

processHoleAt : Value -> String -> SCount -> Value -> Value
processHoleAt v x scount path =
    case v of
        VHole HTmp _ ->
            VHole (pathToName (HVar x) path) scount

        VList inner ->
            VList (processHoleinList inner x scount path)

        _ ->
            v

isCompleted : StmtID -> List (StmtID, Store) -> Bool
isCompleted id execList =
    List.any (\(id_, _) -> id_ == id) execList


isWholeVar : HoleName -> Bool
isWholeVar h =
    nameToPath h == VList []


snapList : CollectCtx -> StmtID -> HoleName -> Maybe Value
snapList ctx id h =
    case Dict.get id ctx.snaps of
        Just st ->
            case lookupHoleVal h st of
                Just (VList vs) ->
                    if isWholeVar h then
                        Just (VList vs)

                    else
                        Nothing

                _ ->
                    Nothing

        Nothing ->
            Nothing


resolveHole : CollectCtx -> HoleName -> StmtID -> HoleMap -> (Value, HoleMap)
resolveHole ctx h id h2eMap =
    resolveHoleSeen ctx h id h2eMap []


resolveHoleSeen : CollectCtx -> HoleName -> StmtID -> HoleMap -> List StmtID -> (Value, HoleMap)
resolveHoleSeen ctx h id h2eMap seen =
    if List.member id seen then
        (VHole h id, h2eMap)

    else
        let
            finish v nd =
                ( v, Dict.insert (valHoleKey h id) (value2Expr v) nd )

            fromSnap chaseHole chaseId =
                case snapList ctx id h of
                    Just vs ->
                        finish vs h2eMap

                    Nothing ->
                        if chaseId /= id then
                            let
                                ( vFinal, nd ) =
                                    resolveHoleSeen ctx chaseHole chaseId h2eMap (id :: seen)
                            in
                            finish vFinal nd

                        else
                            ( VHole h id, h2eMap )
        in
        if isCompleted id ctx.done then
            case lookupHoleVal h (findStore id ctx.done) of
                Just (VHole h2 id2) ->
                    fromSnap h2 id2

                Just v ->
                    finish v h2eMap

                Nothing ->
                    fromSnap h id

        else
            case Dict.get id ctx.snaps of
                Just st ->
                    case lookupHoleVal h st of
                        Just (VHole h2 id2) ->
                            if isWholeVar h then
                                fromSnap h2 id2

                            else
                                ( VHole h id, h2eMap )

                        Just (VList vs) ->
                            if isWholeVar h then
                                finish (VList vs) h2eMap

                            else
                                ( VHole h id, h2eMap )

                        _ ->
                            ( VHole h id, h2eMap )

                Nothing ->
                    ( VHole h id, h2eMap )


substHoleInStore : Store -> CollectCtx -> HoleMap -> (Store, HoleMap)
substHoleInStore store ctx h2eMap =
    case store of
        [] ->
            ([], h2eMap)

        (x, VHole h id) :: rest ->
            let
                (v_, nd) =
                    resolveHole ctx h id h2eMap

                (newstore, newh2eMap) =
                    substHoleInStore rest ctx nd
            in
            ((x, v_) :: newstore, newh2eMap)

        (x, VList vs) :: rest ->
            let (newvs, newh2eMap) = substHoleInList ctx x vs (VList []) h2eMap in
            let (newstore, newh2eMap_) = substHoleInStore rest ctx newh2eMap in
            ((x, VList newvs) :: newstore, newh2eMap_)

        (x, v) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore rest ctx h2eMap in
            ((x, v) :: newstore, newh2eMap)

findStore : Int -> List (Int, Store) -> Store
findStore id execList =
    case execList of
        [] -> []
        (id_, store_) :: rest ->
            if id_ == id then
                store_
            else
                findStore id rest

-- substHoleInIO : IO -> List (StmtID, Store, IO) -> IO
-- substHoleInIO io execList = 
--     let input = getIO io "input" in
--     let output = getIO io "output" in
--     let newinput = substHoleInInput input execList in
--     let newoutput = substHoleInOutput output execList 0 in
--     [("input", newinput), ("output", newoutput)]
    

-- substHoleInInput : List Value -> List (StmtID, Store, IO) -> List Value
-- substHoleInInput input execList =
--     case input of
--         [VHole h id] -> 
--             if List.any (\(id_, _, _) -> id_ == id) execList then
--                 let io = findIO id execList in
--                 getIO io "input"
--             else [VHole h id]
--         _ -> input
        
-- findIO : Int -> List (Int, Store, IO) -> IO
-- findIO id execList =
--     case execList of
--         [] -> []
--         (id_, _, io_) :: rest ->
--             if id_ == id then
--                 io_
--             else
--                 findIO id rest


findIndex : Store -> HoleBindings -> Expr -> (String, Value)
findIndex store holeBindings e =
    case e of
        EVar _ x -> (x, VList [])
        EIndex _ e1 e2 ->
            let (x, path) = findIndex store holeBindings e1 in
            let v = eval store holeBindings e2 in
            case v of
                VInt i -> 
                    case path of 
                        VList p -> (x, VList (p ++ [v]))
                        VHole _ _ -> (x, VHole HTmp -1)
                        _ -> ("error", VError "Index invalid")
                VHole _ _ -> (x, VHole HTmp -1)
                _ -> ("error", VError "Index invalid")
        _ -> ("error", VError "Index invalid")



substHoleInList : CollectCtx -> String -> List Value -> Value -> HoleMap -> (List Value, HoleMap)
substHoleInList ctx x vs path h2eMap =
    substHoleInListWalk ctx x vs path 0 h2eMap

substHoleInListWalk : CollectCtx -> String -> List Value -> Value -> Int -> HoleMap -> (List Value, HoleMap)
substHoleInListWalk ctx x vs path i h2eMap =
    case vs of
        [] ->
            ([], h2eMap)

        v :: rest ->
            let
                path_ =
                    case path of
                        VList p ->
                            VList (p ++ [VInt i])

                        _ ->
                            VList [VInt i]
            in
            case (x, v, path_) of
                -- if/while 污染：#output 代表从这里起整段未知 output
                ("output", VHole (HVar "output") id, VList [ VInt vid ]) ->
                    case lookup "output" (findStore id ctx.done) of
                        Just (VList nvs) ->
                            if List.length nvs > vid then
                                let
                                    suffix =
                                        List.drop vid nvs

                                    holeExpr =
                                        case suffix of
                                            [ one ] ->
                                                value2Expr one

                                            _ ->
                                                value2Expr (VList suffix)

                                    nd =
                                        Dict.insert (valHoleKey (HVar "output") id) holeExpr h2eMap

                                    (rest_, nd_) =
                                        substHoleInListWalk ctx x rest path (i + 1) nd
                                in
                                (suffix ++ rest_, nd_)

                            else
                                let (rest_, nd_) = substHoleInListWalk ctx x rest path (i + 1) h2eMap in
                                (v :: rest_, nd_)

                        _ ->
                            let (rest_, nd_) = substHoleInListWalk ctx x rest path (i + 1) h2eMap in
                            (v :: rest_, nd_)

                _ ->
                    let
                        (v_, nd) =
                            substHoleAt ctx x v path_ h2eMap

                        (rest_, nd_) =
                            substHoleInListWalk ctx x rest path (i + 1) nd
                    in
                    (v_ :: rest_, nd_)

substHoleAt : CollectCtx -> String -> Value -> Value -> HoleMap -> (Value, HoleMap)
substHoleAt ctx x v path h2eMap =
    case v of
        VHole h id ->
            resolveHole ctx h id h2eMap

        VList inner ->
            let
                (inner_, nd) = substHoleInList ctx x inner path h2eMap
            in
            (VList inner_, nd)

        _ ->
            (v, h2eMap)

reindexResiduals : FwdRes -> FwdRes
reindexResiduals fwdRes =
    let
        idMap : Dict Int Int
        idMap =
            fwdRes.riStmts
                |> List.indexedMap (\newId (oldId, _, _) -> (oldId, newId))
                |> Dict.fromList

        mapId : Int -> Int
        mapId id =
            Dict.get id idMap |> Maybe.withDefault id

        newris =
            List.map
                (\(id, s, st) ->
                    ( mapId id
                    , reindexStmt mapId s
                    , reindexStore mapId st
                    )
                )
                fwdRes.riStmts
    in
    { fwdRes
        | riStmts = newris
        , store = reindexStore mapId fwdRes.store
        , scount = List.length newris
    }


reindexStore : (Int -> Int) -> Store -> Store
reindexStore mapId store =
    List.map (\(x, v) -> (x, reindexValue mapId v)) store


reindexValue : (Int -> Int) -> Value -> Value
reindexValue mapId v =
    case v of
        VHole h id ->
            VHole (reindexHoleName mapId h) (mapId id)

        VList vs ->
            VList (List.map (reindexValue mapId) vs)

        _ ->
            v


reindexStmt : (Int -> Int) -> Stmt -> Stmt
reindexStmt mapId s =
    case s of
        SAssign ws e1 e2 ->
            SAssign ws (reindexExpr mapId e1) (reindexExpr mapId e2)

        SIf ws e s1 s2 ->
            SIf ws (reindexExpr mapId e) (reindexStmt mapId s1) (reindexStmt mapId s2)

        SWhile ws e body ->
            SWhile ws (reindexExpr mapId e) (reindexStmt mapId body)

        SPrint ws e ->
            SPrint ws (reindexExpr mapId e)

        SSeq ws s1 s2 ->
            SSeq ws (reindexStmt mapId s1) (reindexStmt mapId s2)

        SFuncDef ws name params body ->
            SFuncDef ws name params (reindexStmt mapId body)

        SFuncCall ws name args ->
            SFuncCall ws name (List.map (reindexExpr mapId) args)

        _ ->
            s


reindexExpr : (Int -> Int) -> Expr -> Expr
reindexExpr mapId e =
    case e of
        EHole ws h ->
            EHole ws (reindexHoleName mapId h)

        Eop ws op e1 e2 ->
            Eop ws op (reindexExpr mapId e1) (reindexExpr mapId e2)

        ENot ws e1 ->
            ENot ws (reindexExpr mapId e1)

        EParens ws e1 ->
            EParens ws (reindexExpr mapId e1)

        EList ws es ->
            EList ws (List.map (reindexExpr mapId) es)

        EIndex ws e1 e2 ->
            EIndex ws (reindexExpr mapId e1) (reindexExpr mapId e2)

        ELength ws e1 ->
            ELength ws (reindexExpr mapId e1)

        _ ->
            e


-- store 里一般是 #x / #x.0，id 在 VHole 第二项
-- residual 表达式里是 encodeHoleId 过后的 #x-3
reindexHoleName : (Int -> Int) -> HoleName -> HoleName
reindexHoleName mapId h =
    case h of
        HVar x ->
            case splitIdSuffix x of
                Just (base, oldId) ->
                    HVar (base ++ "-" ++ String.fromInt (mapId oldId))

                Nothing ->
                    HVar x

        HSub h_ n ->
            HSub (reindexHoleName mapId h_) n

        _ ->
            h


splitIdSuffix : String -> Maybe (String, Int)
splitIdSuffix s =
    case List.reverse (String.indexes "-" s) of
        i :: _ ->
            let
                base =
                    String.left i s

                rest =
                    String.dropLeft (i + 1) s
            in
            if String.isEmpty base then
                Nothing
            else
                Maybe.map (\n -> (base, n)) (String.toInt rest)

        [] ->
            Nothing