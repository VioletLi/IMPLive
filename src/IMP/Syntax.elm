module IMP.Syntax exposing (..)
import Syntax exposing (MValue(..))
import Syntax exposing (Expr(..))

type alias WS = List String

type alias HCount = Int
type alias SCount = Int

type HoleName 
    = HOri Int
    | HVar String
    | HTmp
    | HSub HoleName Int

type Expr 
    = EVar WS String
    | EInt WS Int
    | EBool WS Bool
    | EString WS String
    | EHole WS HoleName
    | Eop WS String Expr Expr
    | EError String
    | ENot WS Expr
    | EParens WS Expr
    | EList WS (List Expr)
    | EIndex WS Expr Expr
    | ELength WS Expr

type Stmt 
    = SIf WS Expr Stmt Stmt
    | SWhile WS Expr Stmt
    | SAssign WS Expr Expr
    | SRead WS String
    | SPrint WS Expr
    | SSeq WS Stmt Stmt
    | SSkip WS
    | SError String

type Value 
    = VInt Int
    | VBool Bool
    | VString String
    | VHole HoleName StmtID
    | VError String
    | VList (List Value)

type alias StmtID = Int

type alias Store = List (String, Value)

type alias RiStmts = List (StmtID, Stmt, Store)

type alias HoleBindings = List (HoleName, Store, Value)