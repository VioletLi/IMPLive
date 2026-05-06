module Ui.Controller exposing
    ( backwardController
    , forwardController
    , guiEventController
    , runEventsFromScratch
    , printOutput
    , getEventsFromTriggeredEvents
    )

import NewPrinter
import Ui.Model exposing (Model)

{-| Legacy hooks stubbed while the UI targets @NewParser@ only on save; evaluation/GUI pipeline not wired yet.
-}


backwardController : Model -> Result String Model
backwardController _ =
    Err "Backward update is disabled in NewParser shell mode."


forwardController : Model -> Result String Model
forwardController _ =
    Err "Forward run is disabled in NewParser shell mode."


guiEventController : String -> List String -> Model -> Result String Model
guiEventController _ _ model =
    Ok model


runEventsFromScratch : String -> List e -> Result String Model
runEventsFromScratch _ _ =
    Err "Event replay is disabled in NewParser shell mode."


printOutput : Model -> ( String, Model )
printOutput model =
    ( NewPrinter.printValue model.output, model )


getEventsFromTriggeredEvents : List a -> List b
getEventsFromTriggeredEvents _ =
    []
