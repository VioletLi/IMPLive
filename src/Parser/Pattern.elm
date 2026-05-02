module Parser.Pattern exposing (..)

import Parser exposing (..)
import Syntax exposing (..)
import Parser.Utils exposing (..)
import Parser.Extras exposing (..)
import Parser.Expression exposing (..)
import Parser.WhiteSpace exposing (..)


pattern : Parser Pattern
pattern = buildExpressionParser pConsOp (lazy (\_ -> pterm))


pConsOp : OperatorTable Pattern
pConsOp = [[Infix (succeed (\spc -> PCons [spc] ConsType)
                        |. symbol "::"
                        |= mSpaces)
            AssocRight]]


pterm : Parser Pattern
pterm =
    oneOf
    [ pNil
    , pTuple
    , pHtml
    , backtrackable pInt
    , pBool
    , pOk
    , pVar
    , pString
    , pGui
    , pEvent
    ]

pString : Parser Pattern
pString =
    succeed (\s ws ->
            s |> String.toList >>
            List.foldr (\c acc-> PCons [" "] StringType (PChar [] c) acc) (PNil [] StringType)
            |> repPatWS [ws])
        |. symbol "\""
        |= mstring
        |. symbol "\""
        |= mSpaces


pVar : Parser Pattern
pVar =
    succeed (\vn ws ->PVar [ws] vn)
        |= varName
        |= mSpaces


pBool : Parser Pattern
pBool =
    oneOf [
        succeed (\ws -> PBool [ws] True)
        |. keyword "True"
        |= mSpaces
        ,

        succeed (\ws -> PBool [ws] False)
        |. keyword "False"
        |= mSpaces
    ]


pNil : Parser Pattern
pNil =
    succeed (\ws1 ws2 -> PNil [ws1, ws2] SquareType)
        |. symbol "["
        |= mSpaces
        |. symbol "]"
        |= mSpaces


pTuple : Parser Pattern
pTuple =
    succeed (
        \ws1 vn1 ws2 vn2 ws3 -> 
            PTuple [ws1, ws2, ws3] TupleType vn1 vn2
        )
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> pattern)
        |. symbol ","
        |= mSpaces
        |= lazy (\_ -> pattern)
        |. symbol ")"
        |= mSpaces

pHtml : Parser Pattern
pHtml =
    succeed (
        \vn1 ws1 vn2 vn3 vn4 -> 
            PHtml [ws1] vn1 vn2 vn3 vn4
        )
        |. keyword "Html"
        |. symbol "."
        |= varName
        |= mSpaces
        |= lazy (\_ -> pattern)
        |= lazy (\_ -> pattern)
        |= lazy (\_ -> pattern)


pInt : Parser Pattern
pInt =
    oneOf 
        [ succeed (\n ws -> PInt [ws] n)
            |= number
                { int = Just identity
                , hex = Just identity 
                , octal = Just identity
                , binary = Just identity 
                , float = Nothing
                }
            |= mSpaces
        , succeed (\n ws -> PInt [ws] (negate n))
            |. symbol "-"
            |= int
            |= mSpaces
        ]


pOk : Parser Pattern
pOk =
    succeed (\ws -> POk [ws])
        |. symbol "_"
        |= mSpaces


pGui : Parser Pattern
pGui =
    succeed (\ws p1 p2 -> PTuple [ws] GuiType p1 p2)
        |. keyword "Gui"
        |= mSpaces
        |= lazy (\_ -> pattern)
        |= lazy (\_ -> pattern)


pEvent : Parser Pattern
pEvent =
    succeed (\ws1 p1 p2 -> PTuple [ws1] EventType p1 p2)
        |. keyword "Event"
        |= mSpaces
        |= lazy (\_ -> pattern)
        |= lazy (\_ -> pattern)