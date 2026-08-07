module IMP.Syntax exposing (..)

type alias WS = List String

type alias HoleName = Int

type Expr 
    = EVar WS String
    | EInt WS Int
    | EBool WS Bool
    | EString WS String
    | EHole WS HoleName
    | Eop WS String Expr Expr

type Stmt 
    = SIf WS Expr Stmt Stmt
    | SWhile WS Expr Stmt
    | SAssign WS String Expr
    | SRead WS String
    | SPrint WS Expr
    | SSeq WS Stmt Stmt
    | SSkip WS

type RExpr 
    = REHole HoleName Store
    | REExpr Expr
    | REOp String RExpr RExpr
    | Error String

type RStmt 
    = RSIf RExpr RStmt RStmt
    | RSWhile RExpr RStmt
    | RSAssign String RExpr
    | RSRead String 
    | RSPrint RExpr
    | RSSeq RStmt RStmt
    | RSSkip 

type alias IO = List (String, List RExpr, StmtID)

type alias StmtID = Int

type alias Store = List (String, RExpr, StmtID)

type State = BOT | TOP

type alias RiStmts = List (StmtID, RStmt, Store)

type alias HoleBindings = List (HoleName, Store, Expr)