module IMP.Syntax exposing (..)

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
    | SFuncDef WS String (List String) Stmt
    | SFuncCall WS String (List Expr)
    -- 加function定义和call，运行过程里先做语句替换，调用一次替换一次，不支持递归函数
    -- 改intro，还是用quicksort，story变成不完整程序很重要-基本是用函数式做的-命令式里destructive的问题-quicksort为什么要在这挖孔
    -- evaluation里对例子做分类以及重命名，哪些代表了什么，efficiency分两个表，一个表是forward/backward，一个表是fill-and-resume（填第一个孔-第二个孔-第三个孔）
    -- 正文里的例子尽量用benchmark里的
    -- related work三部分bidirectional programming，bidirectional live programming，incomplete program
    -- language要不要拆开？
    -- 今天的重点工作是先增加function定义和call，然后做evaluation，然后再改intro和related work，交初稿，争取明天结束初稿



type Value 
    = VInt Int
    | VBool Bool
    | VString String
    | VHole HoleName StmtID
    | VError String
    | VList (List Value)

type alias StmtID = Int

type alias Store = List (String, Value)

type alias FuncDef =
    { seqWs : WS
    , ws : WS
    , name : String
    , params : List String
    , body : Stmt
    }

type alias FuncEnv = List FuncDef

type alias RiStmts = List (StmtID, Stmt, Store)

type alias HoleBindings = List (HoleName, Store, Value)