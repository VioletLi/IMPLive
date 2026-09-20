module IMP.Parser_ exposing (..)

import Set
import Parser exposing (..)
import Parser.Expression exposing (..)
import IMP.Syntax exposing (..)

parseExpr : String -> Result (List DeadEnd) Expr
parseExpr =
    run (succeed identity |. mSpaces |= expr |. end)


parseValue : String -> Result (List DeadEnd) Value
parseValue =
    run (succeed identity |. mSpaces |= value_ |. end)


parseStore : String -> Result (List DeadEnd) Store
parseStore =
    run (succeed identity |. mSpaces |= store_ |. end)


store_ : Parser Store
store_ =
    succeed identity
        |. symbol "["
        |. mSpaces
        |= storeItems
        |. symbol "]"
        |. mSpaces


storeItems : Parser Store
storeItems =
    oneOf
        [ succeed (\bind rest -> bind :: rest)
            |= storeBind
            |= storeTail
        , succeed []
        ]


storeBind : Parser ( String, Value )
storeBind =
    succeed (\x v -> ( x, v ))
        |= storeVar
        |. mSpaces
        |. symbol ":="
        |. mSpaces
        |= lazy (\_ -> value_)


storeTail : Parser Store
storeTail =
    loop [] storeTailHelper


storeTailHelper : Store -> Parser (Step Store Store)
storeTailHelper revItems =
    oneOf
        [ succeed (\bind -> Loop (bind :: revItems))
            |. symbol ","
            |. mSpaces
            |= storeBind
        , succeed ()
            |> map (\_ -> Done (List.reverse revItems))
        ]


storeVar : Parser String
storeVar =
    variable
        { start = Char.isLower
        , inner = \c -> Char.isAlphaNum c || c == '_'
        , reserved =
            Set.fromList
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
                , "length"
                ]
        }


value_ : Parser Value
value_ =
    oneOf
        [ vhole
        , vlist
        , vstring
        , vtrue
        , vfalse
        , vint
        ]


vhole : Parser Value
vhole =
    succeed VHole
        |. symbol "{"
        |. mSpaces
        |= holeName
        |. mSpaces
        |. symbol "@"
        |. mSpaces
        |= holeId
        |. mSpaces
        |. symbol "}"
        |. mSpaces


holeId : Parser Int
holeId =
    oneOf
        [ succeed negate
            |. symbol "-"
            |= int
        , int
        ]


holeName : Parser HoleName
holeName =
    oneOf
        [ succeed HTmp
            |. symbol "*"
        , succeed identity
            |. symbol "#"
            |= holeNameAfterHash
        ]


holeNameAfterHash : Parser HoleName
holeNameAfterHash =
    holeNameBase |> andThen holeSubs


holeNameBase : Parser HoleName
holeNameBase =
    oneOf
        [ succeed HOri
            |= int
        , succeed HVar
            |= holeVar
        ]


holeVar : Parser String
holeVar =
    variable
        { start = Char.isLower
        , inner = Char.isAlphaNum
        , reserved = Set.empty
        }


holeSubs : HoleName -> Parser HoleName
holeSubs acc =
    loop acc holeSubsHelper


holeSubsHelper : HoleName -> Parser (Step HoleName HoleName)
holeSubsHelper acc =
    oneOf
        [ succeed (\n -> Loop (HSub acc n))
            |. symbol "_"
            |= int
        , succeed (Done acc)
        ]


vint : Parser Value
vint =
    oneOf
        [ succeed (\n -> VInt -n)
            |. symbol "-"
            |= int
            |. mSpaces
        , succeed VInt
            |= int
            |. mSpaces
        ]


vtrue : Parser Value
vtrue =
    succeed (VBool True)
        |. keyword "true"
        |. mSpaces


vfalse : Parser Value
vfalse =
    succeed (VBool False)
        |. keyword "false"
        |. mSpaces


vstring : Parser Value
vstring =
    succeed VString
        |. symbol "\""
        |= string_
        |. symbol "\""
        |. mSpaces


vlist : Parser Value
vlist =
    succeed VList
        |. symbol "["
        |. mSpaces
        |= vlistItems
        |. symbol "]"
        |. mSpaces


vlistItems : Parser (List Value)
vlistItems =
    oneOf
        [ succeed (\v rest -> v :: rest)
            |= lazy (\_ -> value_)
            |= vlistTail
        , succeed []
        ]


vlistTail : Parser (List Value)
vlistTail =
    loop [] vlistTailHelper


vlistTailHelper : List Value -> Parser (Step (List Value) (List Value))
vlistTailHelper revItems =
    oneOf
        [ succeed (\v -> Loop (v :: revItems))
            |. symbol ","
            |. mSpaces
            |= lazy (\_ -> value_)
        , succeed ()
            |> map (\_ -> Done (List.reverse revItems))
        ]


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
            , "length"
            , "input"
            , "output"
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


list : Parser Expr
list =
    succeed (\sOpen parts sClose ->
            let
                (commaWs, exprs) =
                    parts
            in
            EList (sOpen :: commaWs ++ [sClose]) exprs)
        |. symbol "["
        |= mSpaces
        |= listItems
        |. symbol "]"
        |= mSpaces


listItems : Parser (List String, List Expr)
listItems =
    oneOf
        [ succeed (\e rest ->
                ( List.map Tuple.first rest
                , e :: List.map Tuple.second rest
                ))
            |= lazy (\_ -> expr)
            |= listTail
        , succeed ([], [])
        ]


listTail : Parser (List (String, Expr))
listTail =
    loop [] listTailHelper


listTailHelper : List (String, Expr) -> Parser (Step (List (String, Expr)) (List (String, Expr)))
listTailHelper revItems =
    oneOf
        [ succeed (\s e -> Loop ((s, e) :: revItems))
            |. symbol ","
            |= mSpaces
            |= lazy (\_ -> expr)
        , succeed ()
            |> map (\_ -> Done (List.reverse revItems))
        ]


atom : Parser Expr
atom =
    oneOf
        [ hole
        , true
        , false
        , int_
        , string
        , var
        , parens_
        , list
        ]


type ASuffix
    = AIndex String Expr String
    | ALength String


suffixes : Parser (List ASuffix)
suffixes =
    loop [] suffixHelper


suffixHelper : List ASuffix -> Parser (Step (List ASuffix) (List ASuffix))
suffixHelper revSufs =
    oneOf
        [ succeed (\s1 e s2 -> Loop (AIndex s1 e s2 :: revSufs))
            |. symbol "["
            |= mSpaces
            |= lazy (\_ -> expr)
            |. symbol "]"
            |= mSpaces
        , succeed (\s -> Loop (ALength s :: revSufs))
            |. symbol "."
            |. keyword "length"
            |= mSpaces
        , succeed ()
            |> map (\_ -> Done (List.reverse revSufs))
        ]


applySuffix : ASuffix -> Expr -> Expr
applySuffix suf acc =
    case suf of
        AIndex s1 ix s2 ->
            EIndex [s1, s2] acc ix

        ALength s ->
            ELength [s] acc


aexpr : Parser Expr
aexpr =
    succeed (\e sufs -> List.foldl applySuffix e sufs)
        |= atom
        |= suffixes


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
    succeed (\e1 s e2 -> SAssign [s] e1 e2)
        |= lazy (\_ -> expr)
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
