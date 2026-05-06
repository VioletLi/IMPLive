port module Ui.Main exposing (..)

import Browser exposing (element)

import NewParser.Program as NProg
import NewPrinter
import FwdEval
import NewSyntax exposing (Value(..))

import Ui.Model exposing (..)
import Ui.View exposing (view)
import Ui.Controller exposing (..)

import Platform.Cmd as Cmd


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( initModel, Cmd.none )


{-| On save: parse with @NewParser.Program.parse@ and show pretty-printed program (or parse errors).
-}
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SaveCode newCode ->
            case NProg.parse newCode of
                Ok prog ->
                    let
                        outVal =
                            case FwdEval.fwdProgram prog of
                                Ok store ->
                                    VUnit

                                Err e ->
                                    VError ("Runtime error:\n" ++ e)

                        outStr =
                            NewPrinter.printValue outVal

                        model1 =
                            { model
                                | code = newCode
                                , output = outVal
                                , holeBindings = []
                                , mode = RUNNING
                            }
                    in
                    ( model1, sendOutput (outStr ++ "success") )

                Err deadEnds ->
                    let
                        errVal =
                            VError ("Parse error:\n" ++ Debug.toString deadEnds)

                        errStr =
                            NewPrinter.printValue errVal

                        model1 =
                            { model | code = newCode, output = errVal }
                    in
                    ( model1, sendOutput errStr )

        Backward ->
            ( model, sendOutput "Backward disabled (NewParser shell)." )

        BackwardPreview ->
            ( model, sendCode model.code )

        BackwardPreviewRevert ->
            ( model, sendCode model.code )

        SetDelta delta ->
            ( model, sendDelta delta )

        SelectPreEx f ->
            ( model, sendFileName f )

        CatchGUIEvent _ ->
            ( model, sendOutput "GUI events not wired to NewParser yet." )

        ChangeMode mode ->
            let
                model1 =
                    { model | mode = mode }
            in
            ( model1, sendOutput (NewPrinter.printValue model1.output) )

        ChangeEventIndex _ ->
            ( model, sendAlert "Event index UI disabled in NewParser shell." )


port sendCode : String -> Cmd msg

port sendOutput : String -> Cmd msg

port sendDelta : String -> Cmd msg

port sendFileName : String -> Cmd msg

port sendAlert : String -> Cmd msg

port sendMode : String -> Cmd msg

port receiveCode : (String -> msg) -> Sub msg

port receiveDelta : (String -> msg) -> Sub msg

port receiveGUIEvent : (( String, List String ) -> msg) -> Sub msg


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ receiveCode SaveCode
        , receiveDelta SetDelta
        , receiveGUIEvent CatchGUIEvent
        ]
