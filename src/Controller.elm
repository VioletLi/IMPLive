module Controller exposing (..)

import Model exposing (..)
import Set
import Debug exposing (toString)
import Dict
import IMP.Parser_ exposing (parse, parseExpr, parseValue)
import IMP.Eval exposing (exec, fill)
import IMP.Uneval exposing (unexec)
import IMP.Utils exposing (preprocessStmt, exprHoleKey, lookup, updateStore, substHoleinStmt)
import IMP.Printer exposing (printOutput, printStmt, printValue)
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
    case parseValue model.output of
        Ok (VList vs) ->
            case parse model.code of
                Ok stmt ->
                    let
                        ( stmt_, hcount ) =
                            preprocessStmt stmt 0

                        newstore =
                            updateStore "output" (VList vs) model.store

                        res =
                            unexec model.startStore model.holeBindings [] Set.empty stmt_ hcount 0 ( newstore, model.riStmts )
                    in
                    case res.stmt of
                        SError info ->
                            { model | output = info }

                        _ ->
                            let
                                newCode =
                                    printStmt res.stmt
                            in
                            { model
                                | code = newCode
                                , holeBindings = res.holeBindings
                                , riStmts = res.riStmts
                                , store = newstore
                                , output = printValue (VList vs)
                                , codeBackup =
                                    if commit then
                                        newCode

                                    else
                                        model.codeBackup
                                , hbBackup =
                                    if commit then
                                        res.holeBindings

                                    else
                                        model.hbBackup
                                , isOutputChange =
                                    if commit then
                                        False

                                    else
                                        model.isOutputChange
                                , currentContext = -1
                            }

                Err info ->
                    { model | output = toString info }

        Ok _ ->
            { model | output = "Output must be a list, e.g. [1]" }

        Err _ ->
            { model | output = "Parse error in output" }


openFill : Model -> Model
openFill model =
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
            , currentContext = -1
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