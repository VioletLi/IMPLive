module Parser.Heap exposing (..)

import Parser exposing (..)
import Syntax exposing (..)
import Parser.Exp exposing (..)
import Parser.Delta exposing (..)
import Parser.Utils exposing (varName)


heap : Parser Heap
heap =
    oneOf [ backtrackable (succeed (\elm ls -> elm :: ls)
            |. symbol "{"
            |. spaces
            |= decl
            |= declloop
            |. symbol "}")

        ,   succeed []
            |. symbol "{}"
        ]


declloop : Parser Heap
declloop =
    loop [] letHelper


letHelper : Heap  -> Parser (Step Heap Heap)
letHelper  revDeclList =
    oneOf
    [ succeed (\elm -> Loop (elm :: revDeclList))
        |. symbol ","
        |. spaces
        |= lazy (\_ -> decl)
    , succeed ()
        |> map (\_ -> Done (List.reverse revDeclList))
    ]


decl : Parser (String, ((Exp, Exp), Delta, (Maybe Value, Bool)))
decl =
    succeed (\p e dv -> (p, ((e, e), dv, (Nothing, True))))
        |= varName
        |. spaces
        |. symbol "->"
        |. spaces
        |. symbol "("
        |. spaces
        |= lazy (\_ -> exp)
        |. symbol ","
        |. spaces
        |= lazy (\_ -> delta)
        |. symbol ")"
        |. spaces