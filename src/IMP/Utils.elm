module IMP.Utils exposing (..)

import IMP.Syntax exposing (..)
import Dict exposing (Dict)
type alias HoleMap = Dict String Expr

hasHole : List Value -> Bool
hasHole vs =
    case vs of
        [] -> False
        (VHole HTmp _) :: _ -> True
        v :: rest -> 
            case v of
                VList vs_ -> (hasHole vs_) || (hasHole rest)
                VHole _ _ -> True
                _ -> hasHole rest


isIndet : Value -> Bool
isIndet v =
    case v of
        VHole _ _ ->
            True

        VList vs ->
            hasHole vs

        _ ->
            False


outputRowAt : Store -> Int -> Maybe Value
outputRowAt store i =
    case lookup "output" store of
        Just (VList vs) ->
            if i >= 0 && i < List.length vs then
                List.head (List.drop i vs)

            else
                Nothing

        _ ->
            Nothing

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
        SAssign ws e1 e2 -> 
            let (e1_, hcount_) = preprocessExpr e1 hcount in
            let (e2_, hcount__) = preprocessExpr e2 hcount_ in
            (SAssign ws e1_ e2_, hcount__)
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
        SFuncDef ws name params body ->
            let (body_, hcount_) = preprocessStmt body hcount in
            (SFuncDef ws name params body_, hcount_)
        SFuncCall ws name args ->
            let (args_, hcount_) = preprocessList args hcount in
            (SFuncCall ws name args_, hcount_)

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
        ELength ws e_ ->
            let (e__, hcount_) = preprocessExpr e_ hcount in
            (ELength ws e__, hcount_)

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

lookupHB : HoleName -> Store -> HoleBindings -> Maybe Value
lookupHB h store holeBindings =
    case holeBindings of
        (h_, store_, v) :: rest -> 
            if h == h_ && (isSameStore store store_) then Just v
            else lookupHB h store rest
        [] -> Nothing

isSameStore : Store -> Store -> Bool
isSameStore store1 store2 =
    case (store1, store2) of
        ((x1, v1) :: rest1, (x2, v2) :: rest2) -> 
            if x1 == x2 && v1 == v2 then isSameStore rest1 rest2 else False
        ([], []) -> True
        _ -> False


sameVars : List String -> Store -> Store -> Bool
sameVars xs s1 s2 =
    case xs of
        [] ->
            True

        x :: rest ->
            if lookup x s1 == lookup x s2 then
                sameVars rest s1 s2

            else
                False

updateStore : String -> Value -> Store -> Store
updateStore x v store =
    -- if x == "input" || x == "output" then store else 
    case store of
        (x_, v_) :: rest -> if x == x_ then (x, v) :: rest else (x_, v_) :: updateStore x v rest
        [] -> (x, v) :: store

-- getIO : IO -> String -> List Value
-- getIO io n =
--     case io of 
--         (n_, v) :: rest -> if n == n_ then v else getIO rest n
--         [] -> []

-- updateIO : IO -> String -> List Value -> IO
-- updateIO io n vs =
--     case io of 
--         (n_, vs_) :: rest -> if n == n_ then (n, vs) :: rest else (n_, vs_) :: updateIO rest n vs
--         [] -> []

modVars : FuncEnv -> Stmt -> List String
modVars env s =
    modVarsSeen [] env s


modVarsSeen : List String -> FuncEnv -> Stmt -> List String
modVarsSeen seen env s =
    case s of
        SAssign _ e _ -> 
            case e of
                EVar _ x -> [x]
                EIndex _ e1 e2 -> [findVar e1]
                _ -> []
        SIf _ _ s1 s2 -> modVarsSeen seen env s1 ++ modVarsSeen seen env s2
        SWhile _ _ s_ -> modVarsSeen seen env s_
        SRead _ x -> [x, "input"]
        SPrint _ _ -> ["output"]
        SSeq _ s1 s2 -> modVarsSeen seen env s1 ++ modVarsSeen seen env s2
        SFuncCall _ name args ->
            if List.member name seen then
                []
            else
                case lookupFunc name env of
                    Just ( params, body ) ->
                        List.filter (\x -> not (List.member x params))
                            (modVarsSeen (name :: seen) env body)

                    Nothing ->
                        []
        _ -> []

findVar : Expr -> String
findVar e =
    case e of
        EVar _ x -> x
        EIndex _ e1 _ -> findVar e1
        _ -> "error"

unique : List a -> List a
unique ls =
    case ls of
        [] -> []
        x :: rest ->
            if List.member x rest then unique rest
            else x :: (unique rest)

polluteState : List String -> Store -> SCount -> Store
polluteState mod store scount =
    case mod of
        [] -> store
        x :: rest ->
            if x == "output" then
                let oldval = lookup x store in
                case oldval of
                    Nothing -> [("error", VError "Variable not found")]
                    Just (VList vs) ->
                        let store_ = updateStore x (VList (vs ++ [VHole (HVar x) scount])) store in
                        polluteState rest store_ scount
                    _ -> [("error", VError "Unsupported expression")]
            else
                let store_ = updateStore x (VHole (HVar x) scount) store in
                polluteState rest store_ scount

substHole : HoleMap -> RiStmts -> RiStmts
substHole holes ris =
    case ris of
        [] -> []
        (id, s, store) :: rest ->
            let
                news = substHoleinStmt id s holes
            in
            (id, news, store) :: (substHole holes rest)

substHoleinStmt : StmtID -> Stmt -> HoleMap -> Stmt
substHoleinStmt id s holes =
    case s of
        SIf ws e s1 s2 -> SIf ws (substHoleinExpr id e holes) (substHoleinStmt id s1 holes) (substHoleinStmt id s2 holes)
        SWhile ws e s_ -> SWhile ws (substHoleinExpr id e holes) (substHoleinStmt id s_ holes)
        SAssign ws e1 e2 -> SAssign ws (substHoleinExpr id e1 holes) (substHoleinExpr id e2 holes)
        SRead ws x -> SRead ws x
        SPrint ws e -> SPrint ws (substHoleinExpr id e holes)
        SSeq ws s1 s2 -> SSeq ws (substHoleinStmt id s1 holes) (substHoleinStmt id s2 holes)
        SSkip ws -> SSkip ws
        SError info -> SError info
        SFuncDef ws name params body ->
            SFuncDef ws name params (substHoleinStmt id body holes)
        SFuncCall ws name args ->
            SFuncCall ws name (List.map (\e -> substHoleinExpr id e holes) args)

substHoleinExpr : StmtID -> Expr -> HoleMap -> Expr
substHoleinExpr id e holes =
    case e of
        EVar ws x -> EVar ws x
        Eop ws op e1 e2 -> Eop ws op (substHoleinExpr id e1 holes) (substHoleinExpr id e2 holes)
        EInt ws i -> EInt ws i
        EHole ws h_ ->
            case Dict.get (exprHoleKey h_) holes of
                Just expr_ -> expr_
                Nothing -> EHole ws h_
        EBool ws b -> EBool ws b
        EString ws s -> EString ws s
        EError s -> EError s
        ENot ws e_ -> ENot ws (substHoleinExpr id e_ holes)
        EParens ws e_ -> EParens ws (substHoleinExpr id e_ holes)
        EList ws es -> EList ws (List.map (\e_ -> substHoleinExpr id e_ holes) es)
        EIndex ws e1 e2 -> EIndex ws (substHoleinExpr id e1 holes) (substHoleinExpr id e2 holes)
        ELength ws e_ -> ELength ws (substHoleinExpr id e_ holes)

encodeHoleId h id =
    case h of
        HVar x -> HVar (x ++ "-" ++ String.fromInt id)
        HSub h_ n -> HSub (encodeHoleId h_ id) n
        _ -> h

exprHoleKey h =
    case h of
        HOri n -> "o:" ++ String.fromInt n
        HVar x -> "v:" ++ x
        HTmp -> "t"
        HSub h_ n -> exprHoleKey h_ ++ ". " ++ String.fromInt n

valHoleKey h id =
    exprHoleKey (encodeHoleId h id)

value2Expr : Value -> Expr
value2Expr v =
    case v of
        VInt i -> EInt [] i
        VBool b -> EBool [] b
        VString s -> EString [] s
        VHole h id -> EHole [] (encodeHoleId h id)
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

updateValue : Value -> Value -> Value -> Value
updateValue path vs v =
    case vs of
        VList vs_ ->
            case path of
                VList (VInt i :: []) ->
                    VList (List.take i vs_ ++ [v] ++ List.drop (i + 1) vs_)
                VList (VInt i :: rest) ->
                    let oriv = List.head (List.reverse (List.take (i+1) vs_)) in
                    case oriv of
                        Just oriv_ ->
                            let newv = updateValue (VList rest) oriv_ v in
                            VList (List.take i vs_ ++ [newv] ++ List.drop (i + 1) vs_)
                        _ -> VError "Index out of range"
                _ -> VError "Unsupported expression"
        VHole _ _ ->
            vs
        _ -> VError "Unsupported expression"

findVal : Value -> Value -> Value
findVal path vs =
    case path of
        VList [] ->
            vs

        VList (VInt i :: rest) ->
            case vs of
                VList nvs ->
                    findVal (VList rest) (nthValue nvs i)

                VHole _ _ ->
                    vs

                _ ->
                    VHole HTmp -1

        _ ->
            case vs of
                VHole _ _ ->
                    vs

                _ ->
                    VHole HTmp -1

holeBaseVar : HoleName -> Maybe String
holeBaseVar h =
    case h of
        HVar x ->
            Just x

        HSub h_ _ ->
            holeBaseVar h_

        _ ->
            Nothing


lookupHoleVal : HoleName -> Store -> Maybe Value
lookupHoleVal h store =
    case holeBaseVar h of
        Just x ->
            case lookup x store of
                Just v ->
                    case nameToPath h of
                        VList [] ->
                            Just v

                        path ->
                            case v of
                                VHole _ _ ->
                                    Just v

                                _ ->
                                    case findVal path v of
                                        VError _ ->
                                            Nothing

                                        v_ ->
                                            Just v_

                Nothing ->
                    Nothing

        Nothing ->
            Nothing


nameToPath : HoleName -> Value
nameToPath h =
    VList (nameToPathList h)

nameToPathList : HoleName -> List Value
nameToPathList h =
    case h of
        HSub h_ n ->
            nameToPathList h_ ++ [VInt n]

        _ ->
            []

pathToName : HoleName -> Value -> HoleName
pathToName prefix path =
    case path of
        VList [] ->
            prefix

        VList (VInt i :: rest) ->
            pathToName (HSub prefix i) (VList rest)

        _ ->
            prefix


prepareStmt : Stmt -> ( Stmt, HCount, FuncEnv )
prepareStmt s =
    let
        ( s_, hcount ) =
            preprocessStmt s 0

        ( env, rest ) =
            splitTopFuncs s_
    in
    if hasFuncDef rest then
        ( SError "function definition must be at the top of the program", hcount, env )

    else
        ( rest, hcount, env )


splitTopFuncs : Stmt -> ( FuncEnv, Stmt )
splitTopFuncs s =
    case s of
        SSeq ws (SFuncDef defWs name params body) rest ->
            let
                ( env, bodyStmt ) =
                    splitTopFuncs rest

                entry =
                    { seqWs = ws
                    , ws = defWs
                    , name = name
                    , params = params
                    , body = body
                    }
            in
            ( entry :: env, bodyStmt )

        SFuncDef defWs name params body ->
            ( [ { seqWs = []
                , ws = defWs
                , name = name
                , params = params
                , body = body
                }
              ]
            , SSkip []
            )

        _ ->
            ( [], s )


hasFuncDef : Stmt -> Bool
hasFuncDef s =
    case s of
        SFuncDef _ _ _ _ ->
            True

        SSeq _ s1 s2 ->
            hasFuncDef s1 || hasFuncDef s2

        SIf _ _ s1 s2 ->
            hasFuncDef s1 || hasFuncDef s2

        SWhile _ _ body ->
            hasFuncDef body

        _ ->
            False


attachFuncs : FuncEnv -> Stmt -> Stmt
attachFuncs env body =
    case env of
        [] ->
            body

        f :: [] ->
            let
                def =
                    SFuncDef f.ws f.name f.params f.body
            in
            if isSkip body && List.isEmpty f.seqWs then
                def

            else
                SSeq f.seqWs def body

        f :: rest ->
            SSeq f.seqWs (SFuncDef f.ws f.name f.params f.body) (attachFuncs rest body)


isSkip : Stmt -> Bool
isSkip s =
    case s of
        SSkip _ ->
            True

        _ ->
            False


substHoleinFuncEnv : StmtID -> FuncEnv -> HoleMap -> FuncEnv
substHoleinFuncEnv id env holes =
    List.map
        (\f -> { f | body = substHoleinStmt id f.body holes })
        env


lookupFunc : String -> FuncEnv -> Maybe ( List String, Stmt )
lookupFunc name env =
    case env of
        f :: rest ->
            if f.name == name then
                Just ( f.params, f.body )

            else
                lookupFunc name rest

        [] ->
            Nothing


isErrorValue : Value -> Bool
isErrorValue v =
    case v of
        VError _ ->
            True

        _ ->
            False


isErrorStore : Store -> Bool
isErrorStore store =
    case lookup "error" store of
        Just (VError _) ->
            True

        _ ->
            False


snapshotParams : List String -> Store -> List ( String, Maybe Value )
snapshotParams params store =
    List.map (\x -> ( x, lookup x store )) params


restoreParams : List ( String, Maybe Value ) -> Store -> Store
restoreParams saved store =
    case saved of
        [] ->
            store

        ( x, Just v ) :: rest ->
            restoreParams rest (updateStore x v store)

        ( x, Nothing ) :: rest ->
            restoreParams rest (delStore x store)


overlayParams : List String -> Store -> Store -> Store
overlayParams params from to =
    case params of
        [] ->
            to

        p :: rest ->
            let
                to_ =
                    case lookup p from of
                        Just v ->
                            updateStore p v to

                        Nothing ->
                            delStore p to
            in
            overlayParams rest from to_


prependArgBinds : List String -> List Expr -> Stmt -> Stmt
prependArgBinds params args body =
    case ( params, args ) of
        ( [], [] ) ->
            body

        ( p :: ps, e :: es ) ->
            SSeq [] (SAssign [] (EVar [] p) e) (prependArgBinds ps es body)

        _ ->
            body


splitArgBinds : Int -> Stmt -> Maybe ( List Expr, Stmt )
splitArgBinds n s =
    if n <= 0 then
        Just ( [], s )

    else
        case s of
            SSeq _ (SAssign _ _ e) rest ->
                case splitArgBinds (n - 1) rest of
                    Just ( es, body ) ->
                        Just ( e :: es, body )

                    Nothing ->
                        Nothing

            _ ->
                Nothing


updateFuncEnv : String -> Stmt -> FuncEnv -> FuncEnv
updateFuncEnv name body env =
    List.map
        (\f ->
            if f.name == name then
                { f | body = body }

            else
                f
        )
        env


lookupFuncBody : String -> FuncEnv -> Stmt -> Stmt
lookupFuncBody name env defaultBody =
    case lookupFunc name env of
        Just ( _, body ) ->
            body

        Nothing ->
            defaultBody


mergeFuncEnv : FuncEnv -> FuncEnv -> FuncEnv -> FuncEnv
mergeFuncEnv env1 env2 orig =
    List.map
        (\f ->
            let
                body1 =
                    lookupFuncBody f.name env1 f.body

                body2 =
                    lookupFuncBody f.name env2 f.body
            in
            if body1 /= f.body then
                { f | body = body1 }

            else
                { f | body = body2 }
        )
        orig


substParams : List String -> List Expr -> Stmt -> Stmt
substParams params args s =
    substParamStmt (List.map2 Tuple.pair params args) s


lookupParam : String -> List ( String, Expr ) -> Maybe Expr
lookupParam x env =
    case env of
        ( p, e ) :: rest ->
            if p == x then
                Just e

            else
                lookupParam x rest

        [] ->
            Nothing


substParamStmt : List ( String, Expr ) -> Stmt -> Stmt
substParamStmt env s =
    case s of
        SAssign ws e1 e2 ->
            SAssign ws (substParamExpr env e1) (substParamExpr env e2)

        SIf ws e s1 s2 ->
            SIf ws (substParamExpr env e) (substParamStmt env s1) (substParamStmt env s2)

        SWhile ws e body ->
            SWhile ws (substParamExpr env e) (substParamStmt env body)

        SPrint ws e ->
            SPrint ws (substParamExpr env e)

        SSeq ws s1 s2 ->
            SSeq ws (substParamStmt env s1) (substParamStmt env s2)

        SFuncCall ws name args ->
            SFuncCall ws name (List.map (substParamExpr env) args)

        SFuncDef ws name params body ->
            SFuncDef ws name params (substParamStmt env body)

        _ ->
            s


substParamExpr : List ( String, Expr ) -> Expr -> Expr
substParamExpr env e =
    case e of
        EVar ws x ->
            case lookupParam x env of
                Just arg ->
                    arg

                Nothing ->
                    EVar ws x

        Eop ws op e1 e2 ->
            Eop ws op (substParamExpr env e1) (substParamExpr env e2)

        ENot ws e1 ->
            ENot ws (substParamExpr env e1)

        EParens ws e1 ->
            EParens ws (substParamExpr env e1)

        EList ws es ->
            EList ws (List.map (substParamExpr env) es)

        EIndex ws e1 e2 ->
            EIndex ws (substParamExpr env e1) (substParamExpr env e2)

        ELength ws e1 ->
            ELength ws (substParamExpr env e1)

        _ ->
            e