module IMP.Syntax exposing (..)
import Syntax exposing (MValue(..))

type alias WS = List String

type alias HCount = Int
type alias SCount = Int

type HoleName 
    = HOri Int
    | HVar Int

type Expr 
    = EVar WS String
    | EInt WS Int
    | EBool WS Bool
    | EString WS String
    | EHole WS HoleName
    | Eop WS String Expr Expr
    | EError String

type Stmt 
    = SIf WS Expr Stmt Stmt
    | SWhile WS Expr Stmt
    | SAssign WS String Expr
    | SRead WS String
    | SPrint WS Expr
    | SSeq WS Stmt Stmt
    | SSkip WS

type Value 
    = VInt Int
    | VBool Bool
    | VString String
    | VHole HoleName StmtID
    | VError String

type alias IO = List (String, List Value)

type alias StmtID = Int

type alias Store = List (String, Value)

type State = BOT | TOP

type alias RiStmts = List (StmtID, Stmt, (Store, IO))

type alias HoleBindings = List (HoleName, Store, Value)