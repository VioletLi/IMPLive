port module Ui.Main exposing (..)

import Browser exposing (..)
import Html exposing (..)

import Ui.Model exposing (..)
import Ui.View exposing (..)
import Ui.Controller exposing (backwardController)
import Ui.Controller exposing (forwardController)

import Syntax exposing (..)

import Parser exposing (..)
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
init _ = (Ui.Model.initModel, Cmd.none)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model = 
    case msg of
        SaveCode newCode -> 
            let
                newModelRes = 
                    forwardController 
                        { model | code = newCode
                                , runningExp = defaultRunningExp
                                , runningHeap = defaultRunningHeap
                                , runningID = defaultRunningID
                                , triggeredEvents = defaultTriggeredEvents
                                , mode = RUNNING 
                                , eventIndex = defaultEventIndex }
            in
                case newModelRes of
                    Result.Ok model1 ->
                        let 
                            (output, model2) = printOutput model1
                        in
                            (model2, sendOutput output)
                    Result.Err err -> 
                        ({model | code = newCode}, sendOutput err)

        Backward ->
            let
                newModelRes = backwardController model 
            in
                case newModelRes of
                    Result.Ok model1 -> 
                        let
                            (output, model2) = printOutput model1
                        in
                            (model2
                            , Cmd.batch 
                                [sendCode model2.code
                                , sendOutput output
                                ]
                            )

                    Result.Err err ->
                        (model, sendCode err)

        BackwardPreview ->
            let
                newModelRes = backwardController model
            in
                case newModelRes of
                    Result.Ok newModel -> (model, sendCode newModel.code)
                    Result.Err err ->
                        (model, sendCode err) 

        BackwardPreviewRevert -> (model, sendCode model.code)          

        SetDelta delta -> ({model | delta = delta}, sendDelta delta)

        SelectPreEx f -> (model, sendFileName f)

        CatchGUIEvent (eventName, args) -> 
            let
                newModelRes = guiEventController eventName args model
            in
                case newModelRes of
                    Result.Ok model1 -> 
                        let
                            (output, model2) = printOutput model1
                        in
                            (model2, sendOutput output)
                    
                    Result.Err info ->
                        (model, sendOutput info)
        
        -- Reset eventIndex when mode is changed
        ChangeMode mode -> 
            let
                model1 = 
                    { model | mode = mode
                            , eventIndex = defaultEventIndex 
                            , triggeredEvents = 
                                case mode of
                                    EDITING ->
                                        case model.triggeredEvents of
                                            (exp, _) :: tails -> (exp, DId) :: tails
                                            []                -> []
                                    _       -> model.triggeredEvents
                    }    

                (output, model2) = printOutput model1
            in
                (model2, sendOutput output)
        
        -- Change event index through select, and see the output corresponding to the events
        -- 1. judge whether newEventIndexStr can be added into eventIndex
        -- 2. cut triggeredEvent and re-run code to get the prev output
        ChangeEventIndex newEventIndexStr -> 
        -- send html command to add init delta attribute of DOM
            let
                newEventIndex = 
                    case String.toInt newEventIndexStr of
                        Just i  -> i
                        Nothing -> model.eventIndex
            in
                if newEventIndex >= (List.length model.triggeredEvents) then
                    (model, sendAlert "No more events!")
                else if newEventIndex < 0 then
                    (model, sendAlert "No more events!")
                else
                    let
                        events = List.drop newEventIndex model.triggeredEvents                    
                        modelPrevRes = runEventsFromScratch model.code <| getEventsFromTriggeredEvents events
                    in
                        case modelPrevRes of 
                            Result.Ok modelPrev -> 
                                let
                                    (tmpOutput, _) = printOutput modelPrev
                                in
                                    ({ model | eventIndex = newEventIndex}, sendOutput tmpOutput)
                            
                            Result.Err info -> 
                                (model, sendOutput info)


port sendCode     : String -> Cmd msg
port sendOutput   : String -> Cmd msg
port sendDelta    : String -> Cmd msg
port sendFileName : String -> Cmd msg
port sendAlert    : String -> Cmd msg   
port sendMode     : String -> Cmd msg 

port receiveCode     : (String -> msg) -> Sub msg
port receiveDelta    : (String -> msg) -> Sub msg
port receiveGUIEvent : ((String, List String) -> msg) -> Sub msg


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ receiveCode SaveCode
        , receiveDelta SetDelta
        , receiveGUIEvent CatchGUIEvent
        ]