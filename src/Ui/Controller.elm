module Ui.Controller exposing (..)

import Ui.Model exposing(Model)
import Printer.Exp as Exp
import Syntax exposing (..)
import Parser exposing (..)
import Eval exposing (..)
import Parser.Delta exposing (delta)
import Parser.Exp exposing (parse)
import LangUtils.Fuse exposing (..)
import LangUtils.Preprocess exposing (..)
import LangUtils.Postprocess exposing (..)
import Printer.Exp as Exp
import LangUtils.GUI exposing (eventToExp)
import Printer.Html
import Ui.Model exposing (defaultEventIndex)
import Ui.Model exposing (initModel)
import Ui.Model exposing (Code)
import LangUtils.Equality exposing (eqExp)
import Printer.Exp exposing (listLast)
import LangUtils.GUI exposing(dropLast)

forwardController : Model -> Result String Model
forwardController model =
    case (parse model.code) of
        Result.Ok code -> forwardExecute model model.runningHeap code 0
        Result.Err _ -> Result.Err ("ERROR #11 Exp Parse Error: " ++ model.code)


forwardExecute : Model -> Heap -> Exp -> ID -> Result String Model
forwardExecute model initHeap initExp initID =
    (fwd initHeap initExp initID) |> Result.andThen(
        \(runningHeap, output, runningID) ->
            case output of
                -- GUI
                ETuple _ GuiType snapshotExp guiExp -> 
                    (fwd runningHeap snapshotExp runningID) |> Result.andThen (
                        \(runningHeapGUI, snapshot, runningIDGUI) ->
                            Result.Ok 
                                { model | runningExp = guiExp
                                        , runningHeap = runningHeapGUI
                                        , runningID = runningIDGUI
                                        , output = snapshot }
                    ) 
                -- normal exp
                _ -> 
                    Result.Ok 
                        { model | output = output 
                                , runningExp = output
                                , runningHeap = runningHeap
                                , runningID = runningID }
    )


{-  backwardController: 
    1. cut triggeredEvents by eventIndex
    2. generate delta for gui by traversing cut triggeredEvents, backward it into code
    3. re-run code from scratch by triggeredEvents
-}
backwardController : Model -> Result String Model
backwardController model =
    case (parse model.code, run (delta |. end) model.delta) of
        (Result.Ok code_prev, Result.Ok delta_prev) ->
            let 
                events =  
                    List.drop model.eventIndex model.triggeredEvents
                model1 = 
                    { model | triggeredEvents = events
                            , eventIndex = defaultEventIndex }
                
                deltaPassedToBWD =
                    if eqExp model1.runningExp model1.output then
                        -- noraml
                        delta_prev
                    else
                        -- GUI
                        generateGUIDelta model1.triggeredEvents delta_prev 

                (dv, heap1, _) = preproc deltaPassedToBWD 0
                (h_bwd, exp_bwd, _) = bwd dv heap1 code_prev 0

                h_post = postprocessHeap h_bwd h_bwd
                exp_post = postprocess exp_bwd h_post

                newCode = Exp.print exp_post

                _ = Debug.log "delta" deltaPassedToBWD
            in
                runEventsFromScratch newCode (getEventsFromTriggeredEvents model1.triggeredEvents) |> Result.andThen (
                    \ model2 ->
                        Result.Ok 
                            { model1 | code = newCode
                                     , runningExp = model2.runningExp
                                     , runningHeap = model2.runningHeap
                                     , runningID = model2.runningID
                                     , output = model2.output }
                )
                        
        (Result.Err _, _) -> Result.Err ("ERROR #11 Exp Parse Error: " ++ model.code)
        (_, Result.Err _) -> Result.Err ("ERROR #12 Delta Parse Error: " ++ model.delta)


guiEventController : String -> List String -> Model -> Result String Model
guiEventController eventName args model = 
    let
        eventExp = eventToExp eventName args
        newRunningExp = EApp model.runningExp eventExp
        newModel = { model | triggeredEvents = (eventExp, DZero) :: model.triggeredEvents }
    in
        forwardExecute newModel model.runningHeap newRunningExp model.runningID 


generateGUIDelta : List (Exp, Delta) -> Delta -> Delta
generateGUIDelta events outputDelta =
    let
        eventsWithOutputDelta = 
            case events of
                [] -> []
                (eventExp, _) :: tail -> (eventExp, outputDelta) :: tail

        -- get delta of initial snapshot
        initialSnapshotDelta = 
            case listLast eventsWithOutputDelta of
                Just (_, d) -> d
                Nothing     -> DZero 

        -- get events and delta for all triggered events, except for the default event
        triggeredEvents = dropLast eventsWithOutputDelta

    in
        DTuple 
            initialSnapshotDelta
            (
                List.foldl 
                    (\(eventExp, delta) acc -> DLam eventExp (DTuple delta acc))
                    DZero
                    triggeredEvents
            )


runEventsFromScratch : Code -> List Exp -> Result String Model
runEventsFromScratch code events =
    case parse code of
        Result.Ok gui -> 
            let
                model = { initModel | runningExp = gui }
                modelResAcc = forwardExecute model model.runningHeap model.runningExp model.runningID
            in
                List.foldr 
                    (
                        \eventExp acc -> 
                            acc |> Result.andThen (
                                \modelAcc ->
                                    let
                                        model1 = { modelAcc | runningExp = EApp modelAcc.runningExp eventExp }
                                    in
                                        forwardExecute model1 model1.runningHeap model1.runningExp model1.runningID
                            )
                    )
                    modelResAcc
                    events  
        
        Result.Err _ -> Result.Err ("ERROR #11 Exp Parse Error: " ++ code)


printOutput : Model -> (String, Model)
printOutput model =
    case model.output of
        EHtml _ _ _ _ _ -> Printer.Html.printHTML model.output model
        _               -> (Exp.print model.output, model) 


getEventsFromTriggeredEvents : List (Exp, Delta) -> List Exp
getEventsFromTriggeredEvents triggeredEvents =
    List.map Tuple.first <| dropLast triggeredEvents