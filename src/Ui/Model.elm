module Ui.Model exposing(..)

import Syntax exposing (..)
import LangUtils.GUI exposing (..)


type alias Code = String
type alias Delta = String

type Mode = NotStart | RUNNING | EDITING

type alias Model =
    { code : Code
    , runningExp : Exp
    , runningHeap : Heap
    , runningID : ID
    , triggeredEvents : List (Exp, Syntax.Delta)
    , output : Exp
    , delta : Delta  -- for dev
    , preExs : List String -- Precluded Examples
    , mode : Mode
    , eventIndex : Int 
    }


type Msg
    = SaveCode Code
    | CatchGUIEvent (String, (List String))
    | Backward
    | BackwardPreview
    | BackwardPreviewRevert
    | SetDelta Delta -- for dev
    | SelectPreEx String
    | ChangeMode Mode
    | ChangeEventIndex String

defaultCode : Code
defaultCode = ""
defaultRunningExp : Exp
defaultRunningExp = EError "No Running Exp"
defaultRunningHeap : Heap
defaultRunningHeap = []
defaultRunningID : ID
defaultRunningID = 0
defaultTriggeredEvents : List (Exp, Syntax.Delta)
defaultTriggeredEvents = 
    [( ETuple 
        eTupleDefaultWSS 
        EventType 
        (strToExpr "None") 
        (ENil eNilDefaultWSS SquareType)
     , DZero)]
defaultOutput : Exp
defaultOutput = strToExpr ""
defaultDelta : Delta
defaultDelta = "id"
defaultMode : Mode
defaultMode = NotStart

defaultEventIndex : Int
defaultEventIndex = 0


initModel : Model
initModel = { code = defaultCode
            , runningExp = defaultRunningExp
            , runningHeap = defaultRunningHeap
            , runningID = defaultRunningID
            , triggeredEvents = defaultTriggeredEvents
            , output = defaultOutput
            , delta = defaultDelta -- for dev
            , preExs = 
                    [ "New File"
                    , "Calculator"
                    , "Dice Game"
                    , "Meal Ordering"
                    , "Conference Surplus"
                    , "House Sailing"]
            , mode = defaultMode
            , eventIndex = defaultEventIndex
            }