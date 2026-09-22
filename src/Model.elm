module Model exposing(..)

import IMP.Syntax exposing (..)
import IMP.Utils exposing (HoleMap)
import Dict exposing (Dict)
import Set exposing (Set)

type alias Code = String
type alias Output = String
type alias Path = List (HoleName, Int, String)
type Mode = Console | HTML

type alias Model =
    { code : Code
    , output : Output
    , holeBindings : HoleBindings
    , store : Store
    , riStmts : RiStmts
    , startStore : Store
    , holeDict : HoleMap
    , filling : Bool
    , oriHoles : List HoleName
    , fillDraft : Dict String String
    , fillSelected : Set String
    , currentContext : StmtID
    , codeBackup : Code
    , hbBackup : HoleBindings
    , isOutputChange : Bool
    , mode: Mode
    , editingInput : Bool
    , inputDraft : String
    , contextDrafts : Dict String String
    }


type Msg
    = SaveCode Code
    | OutputChange Output
    | Preview
    | Update
    | Revert
    | ClearHB
    | FillAndResume
    | SelectResidual StmtID
    | ContextValueChange String String
    | ToggleFillHole String
    | EditFillHole String String
    | SaveFills
    | CancelFill
    | OpenInput
    | EditInput String
    | SaveInput
    | CancelInput



initModel : Model
initModel =
    { code = ""
    , output = ""
    , holeBindings = []
    , store = []
    , riStmts = []
    , startStore =
        [ ( "input", VList [] )
        , ( "output", VList [] )
        ]
    , holeDict = Dict.empty
    , currentContext = -1
    , codeBackup = ""
    , hbBackup = []
    , isOutputChange = False
    , mode = Console
    , filling = False
    , oriHoles = []
    , fillDraft = Dict.empty
    , fillSelected = Set.empty
    , editingInput = False
    , inputDraft = ""
    , contextDrafts = Dict.empty
    }