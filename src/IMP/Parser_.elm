module IMP.Parser_ exposing (..)

import Set
import Parser exposing (..)
import Parser.Expression exposing (..)
import IMP.Syntax exposing (..)


mSpaces : Parser String
mSpaces =
    getChompedString (chompWhile isWhiteSpace)


isWhiteSpace : Char -> Bool
isWhiteSpace c =
    c == ' ' || c == '\n' || c == '\r'


varName : Parser String
varName =
    variable
    { start = Char.isLower
    , inner = \c -> Char.isAlphaNum c || c == '_'
    , reserved = Set.fromList <|
            [ "if"
            , "then"
            , "else"
            , "end"
            , "while"
            , "do"
            , "skip"
            , "read"
            , "print"
            , "true"
            , "false"
            ]
    }


parse : String -> Result (List DeadEnd) Stmt
parse =
    run (program |. end)


program : Parser Stmt
program =
    stmt


int_ : Parser Expr
int_ =
    succeed (\n s -> EInt [s] n)
        |= int
        |= mSpaces


true : Parser Expr
true =
    succeed (\s -> EBool [s] True)
        |. keyword "true"
        |= mSpaces


false : Parser Expr
false =
    succeed (\s -> EBool [s] False)
        |. keyword "false"
        |= mSpaces


string_ : Parser String
string_ =
    getChompedString (chompUntil "\"")


string : Parser Expr
string =
    succeed (\s ws -> EString [ws] s)
        |. symbol "\""
        |= string_
        |. symbol "\""
        |= mSpaces


var : Parser Expr
var =
    succeed (\v s -> EVar [s] v)
        |= varName
        |= mSpaces


hole : Parser Expr
hole =
    succeed (\s -> EHole [s] (HOri -1))
        |. keyword "_"
        |= mSpaces


parens_ : Parser Expr
parens_ =
    succeed (\s1 e s2 -> EParens [s1, s2] e)
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> expr)
        |. symbol ")"
        |= mSpaces


aexpr : Parser Expr
aexpr =
    oneOf
    [ hole
    , true
    , false
    , int_
    , string
    , var
    , parens_
    ]


bopParser : String -> Parser (Expr -> Expr -> Expr)
bopParser s =
    succeed (\ws -> Eop [ws] s)
        |. symbol s
        |= mSpaces


uopParser : Parser (Expr -> Expr)
uopParser =
    succeed (\ws -> ENot [ws])
        |. symbol "!"
        |= mSpaces


operators : OperatorTable Expr
operators =
    [ [Prefix uopParser]
    , [Infix (bopParser "*") AssocLeft, Infix (bopParser "/") AssocLeft]
    , [Infix (bopParser "++") AssocLeft, Infix (backtrackable (bopParser "+")) AssocLeft, Infix (bopParser "-") AssocLeft]
    , [ Infix (bopParser "<=") AssocNone
      , Infix (bopParser ">=") AssocNone
      , Infix (bopParser "==") AssocNone
      , Infix (bopParser "!=") AssocNone
      , Infix (backtrackable (bopParser "<")) AssocNone
      , Infix (backtrackable (bopParser ">")) AssocNone
      ]
    , [Infix (bopParser "&&") AssocLeft]
    , [Infix (bopParser "||") AssocLeft]
    ]


expr : Parser Expr
expr =
    buildExpressionParser operators (lazy (\_ -> aexpr))


skip : Parser Stmt
skip =
    succeed (\s -> SSkip [s])
        |. keyword "skip"
        |= mSpaces


assign : Parser Stmt
assign =
    succeed (\x s1 s2 e -> SAssign [s1, s2] x e)
        |= varName
        |= mSpaces
        |. symbol ":="
        |= mSpaces
        |= lazy (\_ -> expr)


read_ : Parser Stmt
read_ =
    succeed (\s1 x s2 -> SRead [s1, s2] x)
        |. keyword "read"
        |= mSpaces
        |= varName
        |= mSpaces


print_ : Parser Stmt
print_ =
    succeed (\s e -> SPrint [s] e)
        |. keyword "print"
        |= mSpaces
        |= lazy (\_ -> expr)


if_ : Parser Stmt
if_ =
    succeed (\s1 e s2 sThen s3 sElse s4 ->
            SIf [s1, s2, s3, s4] e sThen sElse)
        |. keyword "if"
        |= mSpaces
        |= lazy (\_ -> expr)
        |. keyword "then"
        |= mSpaces
        |= lazy (\_ -> stmt)
        |. keyword "else"
        |= mSpaces
        |= lazy (\_ -> stmt)
        |. keyword "end"
        |= mSpaces


while_ : Parser Stmt
while_ =
    succeed (\s1 e s2 body s3 ->
            SWhile [s1, s2, s3] e body)
        |. keyword "while"
        |= mSpaces
        |= lazy (\_ -> expr)
        |. keyword "do"
        |= mSpaces
        |= lazy (\_ -> stmt)
        |. keyword "end"
        |= mSpaces


astmt : Parser Stmt
astmt =
    oneOf
    [ skip
    , if_
    , while_
    , read_
    , print_
    , assign
    ]


seqOp : OperatorTable Stmt
seqOp =
    [ [Infix (succeed (\s -> SSeq [s])
                |. symbol ";"
                |= mSpaces)
        AssocRight]
    ]


stmt : Parser Stmt
stmt =
    buildExpressionParser seqOp (lazy (\_ -> astmt))
