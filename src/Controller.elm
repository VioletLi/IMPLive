module Controller exposing (..)

import Model exposing (..)
import Set
import Debug exposing (toString)
import Dict
import IMP.Parser_ exposing (parse, parseExpr, parseStore, parseValue)
import IMP.Eval exposing (exec, fill)
import IMP.Uneval exposing (unexec)
import IMP.Utils exposing (preprocessStmt, exprHoleKey, lookup, updateStore, substHoleinStmt)
import IMP.Printer exposing (printOutput, printStmt, printStore, printValue)
import IMP.Syntax exposing (..)


evalCodeToModel : Code -> Model -> Model
evalCodeToModel code model =
    case parse code of
        Ok stmt ->
            let
                (stmt_, _) =
                    preprocessStmt stmt 0

                res =
                    exec model.startStore model.holeBindings [] stmt_ Set.empty 0
            in
            { model
                | code = code
                , codeBackup = code
                , store = res.store
                , riStmts = res.riStmts
                , output = printOutput res.store
                , isOutputChange = False
                , currentContext = -1
                , contextDraft = ""
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
            case parseValue model1.output of
                Ok (VList vs) ->
                    case parse model1.code of
                        Ok stmt ->
                            let
                                ( stmt_, hcount ) =
                                    preprocessStmt stmt 0

                                newstore =
                                    updateStore "output" (VList vs) model1.store

                                res =
                                    unexec model1.startStore model1.holeBindings [] Set.empty stmt_ hcount 0 ( newstore, model1.riStmts )
                            in
                            case res.stmt of
                                SError info ->
                                    { model1 | output = info }

                                _ ->
                                    let
                                        newCode =
                                            printStmt res.stmt

                                        keepId =
                                            keepContextId model1.currentContext res.riStmts
                                    in
                                    { model1
                                        | code = newCode
                                        , holeBindings = res.holeBindings
                                        , riStmts = res.riStmts
                                        , store = newstore
                                        , output = printValue (VList vs)
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
                                        , contextDraft = printRiContext keepId res.riStmts
                                    }

                        Err info ->
                            { model1 | output = toString info }

                Ok _ ->
                    { model1 | output = "Output must be a list, e.g. [1]" }

                Err _ ->
                    { model1 | output = "Parse error in output" }


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
                (stmt_, _) =
                    preprocessStmt stmt 0

                holes =
                    uniqueOri
                        (collectOriInStmt stmt_
                            ++ collectOriInRiStmts model.riStmts
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
                fill holeDict model.holeBindings
                    { store = model.store
                    , riStmts = model.riStmts
                    , scount = List.length model.riStmts
                    , readOnly = Set.empty
                    }

            newCode =
                case parse model.code of
                    Ok stmt ->
                        let
                            ( stmt_, _ ) =
                                preprocessStmt stmt 0
                        in
                        printStmt (substHoleinStmt 0 stmt_ holeDict)

                    Err _ ->
                        model.code

            keepId =
                keepContextId model.currentContext res.riStmts
        in
        { model
            | filling = False
            , holeDict = holeDict
            , holeBindings = []
            , hbBackup = []
            , code = newCode
            , codeBackup = newCode
            , store = res.store
            , riStmts = res.riStmts
            , output = printOutput res.store
            , currentContext = keepId
            , contextDraft = printRiContext keepId res.riStmts
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
        , contextDraft = printRiContext id model1.riStmts
    }


contextChange : String -> Model -> Model
contextChange text model =
    commitContextDraft { model | contextDraft = text }


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
        case parseStore model.contextDraft of
            Ok store ->
                Ok store

            Err _ ->
                Err "Parse error in residual context"


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


printRiContext : StmtID -> RiStmts -> String
printRiContext id ris =
    case riStoreOf id ris of
        Just store ->
            printStore store

        Nothing ->
            ""


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