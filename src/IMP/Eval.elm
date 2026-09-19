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
        EParens ws e -> eval store holeBindings e
        ENot ws e -> 
            let v = eval store holeBindings e in
            case v of
                VBool b -> VBool (not b)
                VHole HTmp _ -> VHole HTmp -1
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
            let v = eval store holeBindings (Eop [] op e1_ e2_) in
            case v of
                VHole HTmp _ -> Eop [] op e1_ e2_
                _ -> value2Expr v
        EList _ es ->
            EList [] (List.map (\e_ -> simplifyExpr store e_ holeBindings) es)
        EIndex _ e1 e2 ->
            let (x, p) = findIndex store holeBindings (EIndex [] e1 e2) in
            case p of
                VHole _ _ -> 
                    let e1_ = simplifyExpr store e1 holeBindings in
                    let e2_ = simplifyExpr store e2 holeBindings in
                    EIndex [] e1_ e2_
                VList _ ->
                    let v1 = eval store holeBindings e1 in
                    let v2 = eval store holeBindings e2 in
                    case v1 of
                        VList vs ->
                            case v2 of
                                VInt i ->
                                    if i >= 0 && i < List.length vs then
                                        (value2Expr (nthValue vs i))
                                    else 
                                        EError "Index out of range"
                                _ -> EError "Unsupported expression"
                        VString s ->
                            case v2 of
                                VInt i ->
                                    if i >= 0 && i < String.length s then
                                        (value2Expr (VString (String.slice i (i+1) s)))
                                    else 
                                        EError "Index out of range"
                                _ -> EError "Unsupported expression"
                        _ -> EError "Unsupported expression"
                _ -> EError "Unsupported expression"
        ELength _ e_ ->
            let e__ = simplifyExpr store e_ holeBindings in
            case e__ of
                EList _ es -> EInt [] (List.length es)
                _ -> ELength [] e__
        EParens _ e_ ->
            let e__ = simplifyExpr store e_ holeBindings in
            EParens [] e__
        _ -> e

exec : Store -> HoleBindings -> RiStmts -> Stmt -> Set String -> SCount -> FwdRes
exec store holeBindings riStmts stmt readOnly scount =
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
                    let (x, path) = findIndex store holeBindings e1 in
                    let newReadOnly = if Set.member x readOnly then Set.remove x readOnly else readOnly in
                    case path of
                        VHole _ _ ->
                            let e1_ = simplifyExpr store e1 holeBindings in
                            let e2_ = simplifyExpr store e2 holeBindings in
                            {
                                store = updateStore x (VHole (HVar x) scount) store,
                                riStmts = riStmts ++ [(scount, SAssign [] e1_ e2_, store)],
                                readOnly = newReadOnly,
                                scount = scount + 1
                            }
                        VList p ->
                            let oriv = lookup x store in
                            case oriv of
                                Just (VList vs) ->
                                    case v of
                                        VHole _ _ ->
                                            let newv = updateValue path (VList vs) (VHole (pathToName (HVar x) path) scount) in
                                            let e1_ = simplifyExpr store e1 holeBindings in
                                            let e2_ = simplifyExpr store e2 holeBindings in
                                            {
                                                store = updateStore x newv store,
                                                riStmts = riStmts ++ [(scount, SAssign [] e1_ e2_, store)],
                                                readOnly = newReadOnly,
                                                scount = scount + 1
                                            }
                                        VList vs_ ->
                                            if hasHole vs_ then
                                                let resv = processHoleinList vs_ x scount path in
                                                let e1_ = simplifyExpr store e1 holeBindings in
                                                let e2_ = simplifyExpr store e2 holeBindings in
                                                let newv = updateValue path (VList vs) (VList resv) in
                                                {
                                                    store = updateStore x newv store,
                                                    riStmts = riStmts ++ [(scount, SAssign [] e1_ e2_, store)],
                                                    readOnly = newReadOnly,
                                                    scount = scount + 1
                                                }
                                            else
                                                {
                                                    store = updateStore x (updateValue path (VList vs) v) store,
                                                    riStmts = riStmts,
                                                    readOnly = newReadOnly,
                                                    scount = scount
                                                }
                                        _ ->
                                            {
                                                store = updateStore x (updateValue path (VList vs) v) store,
                                                riStmts = riStmts,
                                                readOnly = newReadOnly,
                                                scount = scount
                                            }
                                _ -> {defaultFwdRes | store = [("error", VError "Index not found")]}
                        _ -> {defaultFwdRes | store = [("error", VError "Index not found")]}
                _ -> {defaultFwdRes | store = [("error", VError "Unsupported expression")]}
        SSeq _ s1 s2 -> 
            let
                res1 = exec store holeBindings riStmts s1 readOnly scount
                res2 = exec res1.store holeBindings res1.riStmts s2 res1.readOnly res1.scount
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
                        store_ = polluteState mod store scount
                    in
                    { store = store_
                    , riStmts = riStmts ++ [(scount, SIf [] e_ s1 s2, store)]
                    , readOnly = readOnly
                    , scount = scount + 1
                    }
                VBool True -> exec store holeBindings riStmts s1 readOnly scount
                VBool False -> exec store holeBindings riStmts s2 readOnly scount
                _ -> {defaultFwdRes|store=[("error", VError "Unsupported guard of If")]}
                
        SWhile _ e s -> 
            case eval store holeBindings e of
                VHole HTmp _ -> 
                    let 
                        e_ = simplifyExpr store e holeBindings
                        mod = unique (modVars s) 
                        store_ = polluteState mod store scount
                    in
                    { store = store_    
                    , riStmts = riStmts ++ [(scount, SIf [] e_ (SSeq [] s (SWhile [] e s)) (SSkip []), store)]
                    , readOnly = readOnly
                    , scount = scount + 1
                    }
                VBool True -> exec store holeBindings riStmts (SSeq [] s stmt) readOnly scount
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
        SError s -> {defaultFwdRes | store = [("error", VError s)]}

fill : HoleMap -> HoleBindings -> FwdRes -> FwdRes
fill holes hb fwdRes =
    let
        newris = substHole holes fwdRes.riStmts
        (execList, newris_) = tryExec hb newris fwdRes.scount
    in
        if List.isEmpty execList then reindexResiduals { fwdRes | riStmts = newris_ }
        else
            let (store_, h2eMap) = substHoleInStore fwdRes.store execList Dict.empty in
            let (newris__, h2eMap_) = substHoleInStmtStore newris_ execList h2eMap in
            fill h2eMap_ hb {fwdRes | store = store_, riStmts = newris__}
        -- let (io_, iomap) = substHoleInIO fwdRes.io execList Dict.empty in

substHoleInStmtStore : RiStmts -> List (StmtID, Store) -> HoleMap -> (RiStmts, HoleMap)
substHoleInStmtStore ris execList h2eMap =
    case ris of
        [] -> ([], h2eMap)
        (id, s, store) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore store execList h2eMap in
            let (resstmt, newh2eMap_) = substHoleInStmtStore rest execList newh2eMap in
            -- let newio = substHoleInIO io execList in
            ((id, s, newstore)::resstmt, newh2eMap_)

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
tryExec : HoleBindings -> RiStmts -> SCount -> (List (StmtID, Store), RiStmts)
tryExec hb ris scount =
    case ris of
        [] -> ([], [])
        (id, s, store) :: rest ->
            case s of
                SAssign ws e1 e2 ->
                    case e1 of
                        EVar _ x ->
                            let v = eval store hb e2 in 
                            case v of
                                VHole HTmp _ -> 
                                    let e_ = simplifyExpr store e2 hb in
                                    let (exec_, stmt_) = tryExec hb rest scount in
                                    (exec_, (id, SAssign ws (EVar [] x) e_, store)::stmt_)
                                VList vs ->
                                    if hasHole vs then
                                        let newe = simplifyExpr store e2 hb in
                                        let (exec_, stmt_) = tryExec hb rest scount in
                                        (exec_, (id, SAssign ws (EVar [] x) newe, store)::stmt_)
                                    else
                                        let (exec_, stmt_) = tryExec hb rest scount in
                                        ((id, updateStore x v store)::exec_, stmt_)
                                _ ->
                                    let (exec_, stmt_) = tryExec hb rest scount in
                                    ((id, updateStore x v store)::exec_, stmt_)
                        EIndex _ e1_ e2_ ->
                            let (x, path) = findIndex store hb e1 in
                            let v = eval store hb e2 in
                            case path of
                                VHole _ _ ->
                                    let e1s = simplifyExpr store e1 hb in
                                    let e2s = simplifyExpr store e2 hb in
                                    let (exec_, stmt_) = tryExec hb rest scount in
                                    (exec_, (id, SAssign ws e1s e2s, store)::stmt_)
                                VList _ ->
                                    case lookup x store of
                                        Just (VList vs) ->
                                            case v of
                                                VHole _ _ ->
                                                    let e1s = simplifyExpr store e1 hb in
                                                    let e2s = simplifyExpr store e2 hb in
                                                    let (exec_, stmt_) = tryExec hb rest scount in
                                                    (exec_, (id, SAssign ws e1s e2s, store)::stmt_)
                                                VList vs_ ->
                                                    if hasHole vs_ then
                                                        let e1s = simplifyExpr store e1 hb in
                                                        let e2s = simplifyExpr store e2 hb in
                                                        let (exec_, stmt_) = tryExec hb rest scount in
                                                        (exec_, (id, SAssign ws e1s e2s, store)::stmt_)
                                                    else
                                                        let (exec_, stmt_) = tryExec hb rest scount in
                                                        ((id, updateStore x (updateValue path (VList vs) v) store)::exec_, stmt_)
                                                _ ->
                                                    let (exec_, stmt_) = tryExec hb rest scount in
                                                    ((id, updateStore x (updateValue path (VList vs) v) store)::exec_, stmt_)
                                        _ ->
                                            ([], [])
                                _ ->
                                    ([], [])
                        _ -> ([], [])
                        
                SIf ws e s1 s2 -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e hb in
                            let (exec_, stmt_) = tryExec hb rest scount in
                            (exec_, (id, SIf ws e_ s1 s2, store)::stmt_)
                        VBool True ->
                            let res = exec store hb [] s1 Set.empty scount in
                            let (exec_, stmt_) = tryExec hb rest res.scount in
                            ((id, res.store)::exec_, res.riStmts++stmt_)
                        VBool False -> 
                            let res = exec store hb [] s2 Set.empty scount in
                            let (exec_, stmt_) = tryExec hb rest res.scount in
                            ((id, res.store)::exec_, res.riStmts++stmt_)
                        _ -> ([], [])
                SWhile ws e s_ -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let (exec_, stmt_) = tryExec hb rest scount in
                            (exec_, (id, SIf [] e (SSeq [] s_ (SWhile ws e s_)) (SSkip []), store)::stmt_)
                        VBool True ->
                            let res = exec store hb [] (SSeq [] s_ (SWhile ws e s_)) Set.empty scount in
                            let (exec_, stmt_) = tryExec hb rest res.scount in
                            ((id, res.store)::exec_, res.riStmts++stmt_)
                        VBool False -> 
                            let (exec_, stmt_) = tryExec hb rest scount in
                            ((id, store)::exec_, stmt_)
                        _ -> ([], [])
                SRead _ x -> 
                    let vs = lookup "input" store in
                    case vs of
                        Just (VHole _ _) -> 
                            let (exec_, stmt_) = tryExec hb rest scount in
                            (exec_, (id, SRead [] x, store)::stmt_)
                        Just _ ->
                            let res = exec store hb [] (SRead [] x) Set.empty scount in
                            let (exec_, stmt_) = tryExec hb rest res.scount in
                            ((id, res.store)::exec_, res.riStmts++stmt_)
                        _ -> ([(-2, [])], [])
                        
                SPrint ws e -> 
                    let v = eval store hb e in 
                    case v of
                        VHole HTmp _ -> 
                            let e_ = simplifyExpr store e hb in
                            let (exec_, stmt_) = tryExec hb rest scount in
                            (exec_, (id, SPrint ws e_, store)::stmt_)
                        VList vs ->
                            if hasHole vs then
                                let e_ = simplifyExpr store e hb in
                                let (exec_, stmt_) = tryExec hb rest scount in
                                (exec_, (id, SPrint ws e_, store)::stmt_)
                            else
                                let (exec_, stmt_) = tryExec hb rest scount in
                                let oldv = lookup "output" store in
                                case oldv of
                                    Just (VList vs_) ->
                                        ((id, updateStore "output" (VList (vs_ ++ [VList vs])) store)::exec_, stmt_)
                                    _ -> ([],[])
                                
                        _ ->
                            let res = exec store hb [] (SPrint ws e) Set.empty scount in
                            let (exec_, stmt_) = tryExec hb rest res.scount in
                            ((id, res.store)::exec_, res.riStmts++stmt_)
                _ -> ([(-2, [])], [])
-- 如果能运行就把语句直接从residual删掉，记录被删掉的id，io/store,不然就更新，被删掉的id需要对应着去找到剩余的所有残余语句中的store，更新store的值

substHoleInStore : Store -> List (StmtID, Store) -> HoleMap -> (Store, HoleMap)
substHoleInStore store execList h2eMap =
    case store of
        [] ->
            ([], h2eMap)

        (x, VHole h id) :: rest ->
            if List.any (\(id_, _) -> id_ == id) execList then
                let store_ = findStore id execList in
                case lookup x store_ of
                    Just v ->
                        let nd = Dict.insert (valHoleKey h id) (value2Expr v) h2eMap in
                        let (newstore, newh2eMap) = substHoleInStore rest execList nd in
                        ((x, v) :: newstore, newh2eMap)

                    Nothing ->
                        ([], h2eMap)
            else
                let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
                ((x, VHole h id) :: newstore, newh2eMap)

        (x, VList vs) :: rest ->
            let (newvs, newh2eMap) = substHoleInList execList x vs (VList []) h2eMap in
            let (newstore, newh2eMap_) = substHoleInStore rest execList newh2eMap in
            ((x, VList newvs) :: newstore, newh2eMap_)

        (x, v) :: rest ->
            let (newstore, newh2eMap) = substHoleInStore rest execList h2eMap in
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



substHoleInList : List (StmtID, Store) -> String -> List Value -> Value -> HoleMap -> (List Value, HoleMap)
substHoleInList execList x vs path h2eMap =
    substHoleInListWalk execList x vs path 0 h2eMap

substHoleInListWalk : List (StmtID, Store) -> String -> List Value -> Value -> Int -> HoleMap -> (List Value, HoleMap)
substHoleInListWalk execList x vs path i h2eMap =
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
                    if List.any (\(id_, _) -> id_ == id) execList then
                        case lookup "output" (findStore id execList) of
                            Just (VList nvs) ->
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
                                        substHoleInListWalk execList x rest path (i + 1) nd
                                in
                                (suffix ++ rest_, nd_)

                            _ ->
                                let (rest_, nd_) = substHoleInListWalk execList x rest path (i + 1) h2eMap in
                                (v :: rest_, nd_)
                    else
                        let (rest_, nd_) = substHoleInListWalk execList x rest path (i + 1) h2eMap in
                        (v :: rest_, nd_)

                _ ->
                    let
                        (v_, nd) =
                            substHoleAt execList x v path_ h2eMap

                        (rest_, nd_) =
                            substHoleInListWalk execList x rest path (i + 1) nd
                    in
                    (v_ :: rest_, nd_)

substHoleAt : List (StmtID, Store) -> String -> Value -> Value -> HoleMap -> (Value, HoleMap)
substHoleAt execList x v path h2eMap =
    case v of
        VHole h id ->
            if List.any (\(id_, _) -> id_ == id) execList then
                let
                    store_ = findStore id execList
                in
                case lookup x store_ of
                    Just newx ->
                        let
                            v_ = findVal path newx
                            nd = Dict.insert (valHoleKey h id) (value2Expr v) h2eMap
                        in
                        (v_, nd)

                    Nothing ->
                        (v, h2eMap)
            else
                (v, h2eMap)

        VList inner ->
            let
                (inner_, nd) = substHoleInList execList x inner path h2eMap
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