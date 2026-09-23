module Controller exposing (..)

import Model exposing (..)
import Set
import Debug exposing (toString)
import Dict
import IMP.Parser_ exposing (parse, parseExpr, parseValue)
import IMP.Eval exposing (exec, fill)
import IMP.Uneval exposing (unexec)
import IMP.Utils exposing (prepareStmt, attachFuncs, substHoleinFuncEnv, exprHoleKey, lookup, updateStore, substHoleinStmt, oriCompactMap, remapOriRiStmts)
import IMP.Printer exposing (printOutput, printOutputList, printStmt, printValue)
import IMP.Syntax exposing (..)


evalCodeToModel : Code -> Model -> Model
evalCodeToModel code model =
    case parse code of
        Ok stmt ->
            let
                (stmt_, _, funcEnv) =
                    prepareStmt stmt

                res =
                    exec funcEnv model.startStore model.holeBindings [] stmt_ Set.empty 0
            in
            { model
                | code = code
                , codeBackup = code
                , store = res.store
                , riStmts = res.riStmts
                , output = printOutput res.store
                , isOutputChange = False
                , currentContext = -1
                , contextDrafts = Dict.empty
                , hbBackup = model.holeBindings
            }

        Err info ->
            { model
                | code = code
                , output = toString info
                , store = []
                , riStmts = []
            }




unevalCodeToModel : Model -> Bool -> Model
unevalCodeToModel model commit =
    case applyContextDraft model of
        Err info ->
            { model | output = info }

        Ok model1 ->
            case parseOutputText model1.output of
                Ok vs ->
                    case parse model1.code of
                        Ok stmt ->
                            let
                                ( stmt_, hcount, funcEnv ) =
                                    prepareStmt stmt

                                newstore =
                                    updateStore "output" (VList vs) model1.store

                                res =
                                    unexec funcEnv model1.startStore model1.holeBindings [] Set.empty stmt_ hcount 0 ( newstore, model1.riStmts )
                            in
                            case res.stmt of
                                SError info ->
                                    { model1 | output = info }

                                _ ->
                                    let
                                        newCode =
                                            printStmt (attachFuncs res.funcEnv res.stmt)

                                        keepId =
                                            keepContextId model1.currentContext res.riStmts
                                    in
                                    { model1
                                        | code = newCode
                                        , holeBindings = res.holeBindings
                                        , riStmts = res.riStmts
                                        , store = newstore
                                        , output = printOutputList vs
                                        , codeBackup =
                                            if commit then
                                                newCode

                                            else
                                                model1.codeBackup
                                        , hbBackup =
                                            if commit then
                                                res.holeBindings

                                            else
                                                model1.hbBackup
                                        , isOutputChange =
                                            if commit then
                                                False

                                            else
                                                model1.isOutputChange
                                        , currentContext = keepId
                                        , contextDrafts = contextDraftsOf keepId res.riStmts
                                    }

                        Err info ->
                            { model1 | output = toString info }

                Err info ->
                    { model1 | output = info }


openFill : Model -> Model
openFill model =
    let
        model1 =
            commitContextDraft model
    in
    openFillWith model1


openFillWith : Model -> Model
openFillWith model =
    case parse model.code of
        Ok stmt ->
            let
                (stmt_, _, funcEnv) =
                    prepareStmt stmt

                holes =
                    uniqueOri
                        (collectOriInStmt stmt_
                            ++ collectOriInFuncEnv funcEnv
                        )
            in
            { model
                | filling = True
                , oriHoles = holes
                , fillDraft = Dict.empty
                , fillSelected = Set.empty
            }

        Err info ->
            { model | output = toString info }


saveAndFill : Model -> Model
saveAndFill model =
    case applyContextDraft model of
        Err info ->
            { model | output = info }

        Ok model1 ->
            saveAndFillWith model1


saveAndFillWith : Model -> Model
saveAndFillWith model =
    let
        parsed =
            model.fillSelected
                |> Set.toList
                |> List.filterMap
                    (\key ->
                        Dict.get key model.fillDraft
                            |> Maybe.andThen
                                (\src ->
                                    case parseExpr src of
                                        Ok e ->
                                            Just (key, e)

                                        Err _ ->
                                            Nothing
                                    )
                    )

        holeDict =
            Dict.fromList parsed
    in
    if Set.size model.fillSelected /= List.length parsed then
        { model | output = "Parse error in fill expression" }

    else
        let
            res =
                let
                    funcEnv =
                        case parse model.code of
                            Ok stmt ->
                                let
                                    ( _, _, env ) =
                                        prepareStmt stmt
                                in
                                env

                            Err _ ->
                                []
                in
                fill funcEnv holeDict model.holeBindings
                    { store = model.store
                    , riStmts = model.riStmts
                    , scount = List.length model.riStmts
                    , readOnly = Set.empty
                    }

            ( newCode, newRi ) =
                case parse model.code of
                    Ok stmt ->
                        let
                            ( stmt_, _, funcEnv ) =
                                prepareStmt stmt

                            substEnv =
                                substHoleinFuncEnv 0 funcEnv holeDict

                            substStmt =
                                substHoleinStmt 0 stmt_ holeDict

                            holeMap =
                                oriCompactMap
                                    (collectOriInStmt substStmt
                                        ++ collectOriInFuncEnv substEnv
                                    )
                        in
                        ( printStmt (attachFuncs substEnv substStmt)
                        , remapOriRiStmts holeMap res.riStmts
                        )

                    Err _ ->
                        ( model.code, res.riStmts )

            keepId =
                keepContextId model.currentContext newRi
        in
        { model
            | filling = False
            , holeDict = holeDict
            , holeBindings = []
            , hbBackup = []
            , code = newCode
            , codeBackup = newCode
            , store = res.store
            , riStmts = newRi
            , output = printOutput res.store
            , currentContext = keepId
            , contextDrafts = contextDraftsOf keepId newRi
            , oriHoles = []
            , fillDraft = Dict.empty
            , fillSelected = Set.empty
        }


currentInput : Model -> Value
currentInput model =
    case lookup "input" model.startStore of
        Just v ->
            v

        Nothing ->
            VList []


openInput : Model -> Model
openInput model =
    { model
        | editingInput = True
        , inputDraft = printValue (currentInput model)
    }


saveInput : Model -> Model
saveInput model =
    case parseValue model.inputDraft of
        Ok (VList vs) ->
            let
                newInput =
                    VList vs
            in
            { model
                | editingInput = False
                , inputDraft = ""
                , startStore = updateStore "input" newInput model.startStore
                , store = updateStore "input" newInput model.store
            }

        Ok _ ->
            { model | output = "Input must be a list, e.g. [1, 2, 3]" }

        Err _ ->
            { model | output = "Parse error in input" }


selectResidual : StmtID -> Model -> Model
selectResidual id model =
    let
        model1 =
            commitContextDraft model
    in
    { model1
        | currentContext = id
        , contextDrafts = contextDraftsOf id model1.riStmts
    }


contextValueChange : String -> String -> Model -> Model
contextValueChange x text model =
    let
        drafts =
            Dict.insert x text model.contextDrafts

        model1 =
            { model | contextDrafts = drafts }
    in
    case parseStoreDrafts (riStoreOf model.currentContext model.riStmts) drafts of
        Ok store ->
            { model1 | riStmts = updateRiStore model.currentContext store model.riStmts }

        Err _ ->
            model1


commitContextDraft : Model -> Model
commitContextDraft model =
    case parseContextDraft model of
        Ok store ->
            { model | riStmts = updateRiStore model.currentContext store model.riStmts }

        Err _ ->
            model


applyContextDraft : Model -> Result String Model
applyContextDraft model =
    if model.currentContext < 0 then
        Ok model

    else
        case parseContextDraft model of
            Ok store ->
                Ok { model | riStmts = updateRiStore model.currentContext store model.riStmts }

            Err info ->
                Err info


parseContextDraft : Model -> Result String Store
parseContextDraft model =
    if model.currentContext < 0 then
        Err "No residual selected"

    else
        parseStoreDrafts (riStoreOf model.currentContext model.riStmts) model.contextDrafts


parseStoreDrafts : Maybe Store -> Dict.Dict String String -> Result String Store
parseStoreDrafts maybeStore drafts =
    case maybeStore of
        Nothing ->
            Err "No residual selected"

        Just orig ->
            parseStoreDraftsWalk orig drafts


parseStoreDraftsWalk : Store -> Dict.Dict String String -> Result String Store
parseStoreDraftsWalk orig drafts =
    case orig of
        [] ->
            Ok []

        ( x, oldv ) :: rest ->
            case Dict.get x drafts of
                Just src ->
                    case parseValue src of
                        Ok v ->
                            Result.map (\rest_ -> ( x, v ) :: rest_) (parseStoreDraftsWalk rest drafts)

                        Err _ ->
                            Err ("Parse error in " ++ x)

                Nothing ->
                    Result.map (\rest_ -> ( x, oldv ) :: rest_) (parseStoreDraftsWalk rest drafts)


parseOutputText : String -> Result String (List Value)
parseOutputText src =
    src
        |> String.lines
        |> List.map String.trim
        |> List.filter (\line -> line /= "")
        |> parseOutputLines


parseOutputLines : List String -> Result String (List Value)
parseOutputLines lines =
    case lines of
        [] ->
            Ok []

        line :: rest ->
            case parseValue line of
                Ok v ->
                    Result.map (\vs -> v :: vs) (parseOutputLines rest)

                Err _ ->
                    Err "Parse error in output"


updateRiStore : StmtID -> Store -> RiStmts -> RiStmts
updateRiStore id store ris =
    List.map
        (\( id_, s, st ) ->
            if id_ == id then
                ( id_, s, store )

            else
                ( id_, s, st )
        )
        ris


contextDraftsOf : StmtID -> RiStmts -> Dict.Dict String String
contextDraftsOf id ris =
    case riStoreOf id ris of
        Just store ->
            Dict.fromList (List.map (\( x, v ) -> ( x, printValue v )) store)

        Nothing ->
            Dict.empty


riStoreOf : StmtID -> RiStmts -> Maybe Store
riStoreOf id ris =
    case List.filter (\( id_, _, _ ) -> id_ == id) ris of
        ( _, _, store ) :: _ ->
            Just store

        [] ->
            Nothing


keepContextId : StmtID -> RiStmts -> StmtID
keepContextId id ris =
    if List.any (\( id_, _, _ ) -> id_ == id) ris then
        id

    else
        -1


collectOriInRiStmts : RiStmts -> List HoleName
collectOriInRiStmts ris =
    List.concatMap (\( _, s, _ ) -> collectOriInStmt s) ris


collectOriInFuncEnv : FuncEnv -> List HoleName
collectOriInFuncEnv env =
    List.concatMap (\f -> collectOriInStmt f.body) env


collectOriInStmt : Stmt -> List HoleName
collectOriInStmt s =
    case s of
        SAssign _ e1 e2 ->
            collectOriInExpr e1 ++ collectOriInExpr e2

        SIf _ e s1 s2 ->
            collectOriInExpr e ++ collectOriInStmt s1 ++ collectOriInStmt s2

        SWhile _ e body ->
            collectOriInExpr e ++ collectOriInStmt body

        SPrint _ e ->
            collectOriInExpr e

        SSeq _ s1 s2 ->
            collectOriInStmt s1 ++ collectOriInStmt s2

        SFuncDef _ _ _ body ->
            collectOriInStmt body

        SFuncCall _ _ args ->
            List.concatMap collectOriInExpr args

        _ ->
            []


collectOriInExpr : Expr -> List HoleName
collectOriInExpr e =
    case e of
        EHole _ (HOri n) ->
            [ HOri n ]

        Eop _ _ e1 e2 ->
            collectOriInExpr e1 ++ collectOriInExpr e2

        ENot _ e1 ->
            collectOriInExpr e1

        EParens _ e1 ->
            collectOriInExpr e1

        EList _ es ->
            List.concatMap collectOriInExpr es

        EIndex _ e1 e2 ->
            collectOriInExpr e1 ++ collectOriInExpr e2

        ELength _ e1 ->
            collectOriInExpr e1

        _ ->
            []


uniqueOri : List HoleName -> List HoleName
uniqueOri hs =
    hs
        |> List.foldl
            (\h acc ->
                if List.any (\h_ -> exprHoleKey h_ == exprHoleKey h) acc then
                    acc

                else
                    acc ++ [ h ]
            )
            []
        |> List.sortBy
            (\h ->
                case h of
                    HOri n ->
                        n

                    _ ->
                        0
            )