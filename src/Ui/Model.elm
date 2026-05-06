module Ui.Model exposing (..)

import NewSyntax exposing (..)


type alias Code =
    String

type Mode = NotStart | RUNNING | EDITING

type alias Model =
    { code : Code
    , output : Value
    , mode : Mode
    , holeBindings : HoleBindings
    }


type Msg
    = SaveCode Code
    | CatchGUIEvent ( String, List String )
    | Backward
    | BackwardPreview
    | BackwardPreviewRevert
    | SetDelta String
    | SelectPreEx String
    | ChangeMode Mode
    | ChangeEventIndex String


defaultCode : Code
defaultCode =
    ""


defaultOutput : Value
defaultOutput = VUnit


defaultMode : Mode
defaultMode =
    NotStart


{-| Example names for the menu (not stored on @Model@). -}
defaultPreExs : List String
defaultPreExs =
    [ "New File"
    , "Calculator"
    , "Dice Game"
    , "Meal Ordering"
    , "Conference Surplus"
    , "House Sailing"
    ]


initModel : Model
initModel =
    { code = defaultCode
    , output = defaultOutput
    , mode = defaultMode
    , holeBindings = []
    }
