port module Main exposing (..)

import Browser exposing (..)
import Controller exposing (evalCodeToModel, openFill, saveAndFill, openInput, saveInput, unevalCodeToModel, selectResidual, contextChange)
import Dict
import Html exposing (Html)
import Model exposing (Model, Mode(..), Msg(..))
import Set
import String exposing (left)
import View


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( Model.initModel, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SaveCode newCode ->
            let
                newModel =
                    evalCodeToModel newCode model
            in
            ( newModel, setConsoleVisible newModel.output )

        OutputChange newOutput ->
            let
                ( nop, flag, cmd ) =
                    if model.mode == Console && left 9 newOutput == "<textarea" then
                        ( model.output, False, Cmd.none )

                    else
                        ( newOutput, True, setAceRed () )
            in
            ( { model | output = nop, isOutputChange = flag }, cmd )

        FillAndResume ->
            ( openFill model, Cmd.none )

        ToggleFillHole key ->
            ( { model
                | fillSelected =
                    if Set.member key model.fillSelected then
                        Set.remove key model.fillSelected

                    else
                        Set.insert key model.fillSelected
              }
            , Cmd.none
            )

        EditFillHole key text ->
            ( { model | fillDraft = Dict.insert key text model.fillDraft }, Cmd.none )

        SaveFills ->
            let
                newModel =
                    saveAndFill model
            in
            ( newModel
            , Cmd.batch
                [ setConsoleVisible newModel.output
                , sendCode ( newModel.code, False )
                ]
            )

        CancelFill ->
            ( { model
                | filling = False
                , oriHoles = []
                , fillDraft = Dict.empty
                , fillSelected = Set.empty
              }
            , Cmd.none
            )

        SelectResidual id ->
            ( selectResidual id model, Cmd.none )

        ContextChange text ->
            ( contextChange text model, Cmd.none )

        Preview ->
            let
                newModel =
                    unevalCodeToModel model False
            in
            ( newModel
            , Cmd.batch
                [ setConsoleVisible newModel.output
                , sendCode ( newModel.code, False )
                ]
            )

        Update ->
            let
                newModel =
                    unevalCodeToModel model True
            in
            ( newModel
            , Cmd.batch
                [ setConsoleVisible newModel.output
                , sendCode ( newModel.code, False )
                ]
            )

        Revert ->
            ( { model
                | code = model.codeBackup
                , holeBindings = model.hbBackup
              }
            , sendCode ( model.codeBackup, model.isOutputChange )
            )

        ClearHB ->
            ( { model | holeBindings = [] }, Cmd.none )

        OpenInput ->
            ( openInput model, Cmd.none )

        EditInput text ->
            ( { model | inputDraft = text }, Cmd.none )

        SaveInput ->
            let
                newModel =
                    saveInput model
            in
            ( newModel, setConsoleVisible newModel.output )

        CancelInput ->
            ( { model | editingInput = False, inputDraft = "" }, Cmd.none )


view : Model -> Html Msg
view =
    View.view


port sendCode : ( String, Bool ) -> Cmd msg
port sendOutput : String -> Cmd msg
port setAceRed : () -> Cmd msg
port setConsoleVisible : String -> Cmd msg
port receiveCode : (String -> msg) -> Sub msg
port receiveOutput : (String -> msg) -> Sub msg


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ receiveCode SaveCode
        , receiveOutput OutputChange
        ]