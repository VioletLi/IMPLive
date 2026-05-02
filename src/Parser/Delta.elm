module Parser.Delta exposing (..)

import Parser exposing (..)
import Syntax exposing (..)
import Parser.Exp exposing (exp)
import Parser.Utils exposing (..)
import Parser.Extras exposing (..)
import Parser.Expression exposing (..)

delta : Parser Delta
delta =
    buildExpressionParser operators (lazy <| \_ -> temp)

operators : OperatorTable Delta
operators =
    [ [Infix dCons AssocRight]
    , [Infix dCom  AssocRight]
    ]


temp : Parser Delta
temp =
    oneOf
    [ dId
    , dAdd
    , backtrackable dParens
    , backtrackable dTuple
    , dLam
    , dNone
    , dInsert
    , dDelete
    , dHtml
    , dString
    ]


dString : Parser Delta
dString =
    succeed strDiff
        |. symbol "\""
        |= mstring
        |. symbol "\"=>\""
        |= mstring
        |. symbol "\""

-- Transform updates for string to deltas for lists

strDiff : String -> String -> Delta
strDiff s1 s2 =
    Tuple.second <| diff (String.toList s1) (String.toList s2)


dParens : Parser Delta
dParens =
    succeed identity
        |. symbol "("
        |. spaces
        |= lazy (\_ -> delta)
        |. spaces
        |. symbol ")"
        |. spaces


dId : Parser Delta
dId =
    succeed DId
        |. keyword "id"
        |. spaces


dNone : Parser Delta
dNone =
    succeed DZero
        |. symbol "?"
        |. spaces


dAdd : Parser Delta
dAdd =
    succeed DAdd
        |. symbol "+"
        |= oneOf
            [ int
            , succeed negate
                |. symbol "-"
                |= int
            ]
        |. spaces


dTuple : Parser Delta
dTuple =
    succeed DTuple
        |. symbol "("
        |. spaces
        |= lazy (\_ -> delta)
        |. spaces
        |. symbol ","
        |. spaces
        |= lazy (\_ -> delta)
        |. spaces
        |. symbol ")"
        |. spaces


dLam : Parser Delta
dLam =
    succeed DLam
        |. symbol "\\"
        |. spaces
        |= exp
        |. symbol "->"
        |. spaces
        |= lazy (\_ -> delta)


dCons : Parser (Delta -> Delta -> Delta)
dCons =
    succeed (DCons Nothing)
        |. symbol "::"
        |. spaces


dHtml : Parser Delta
dHtml =
    succeed DHtml
        |. keyword "Html"
        |. symbol "."
        |= varName
        |. spaces
        |= lazy (\_ -> delta)
        |= lazy (\_ -> delta)
        |= lazy (\_ -> delta)


dCom : Parser (Delta -> Delta -> Delta)
dCom =
    succeed DCom
        |. symbol ";"
        |. spaces


dInsert : Parser Delta
dInsert =
    succeed DInsert
        |. keyword "insert"
        |. spaces
        |= int
        |. spaces
        |= exp
        |. spaces


dDelete : Parser Delta
dDelete =
    succeed DDelete
        |. keyword "delete"
        |. spaces
        |= int
        |. spaces