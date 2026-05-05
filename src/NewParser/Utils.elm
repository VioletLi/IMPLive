module NewParser.Utils exposing (..)

import Char
import Set exposing (Set)
import Parser exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)


{-| Keywords reserved for commands / declarations (not valid variable names). -}
reservedNames : Set String
reservedNames =
    Set.fromList
        [ "fun"
        , "if"
        , "then"
        , "else"
        , "while"
        , "do"
        , "skip"
        , "return"
        , "True"
        , "False"
        , "true"
        , "false"
        , "Html"
        , "skip"
        ]


varName : Parser String
varName =
    variable
        { start = Char.isAlpha
        , inner = \c -> Char.isAlphaNum c || c == '_'
        , reserved = reservedNames
        }


{-| Double-quoted string without escapes (same spirit as @Parser.Utils.mstring@). -}
mstring : Parser String
mstring =
    getChompedString (chompUntil "\"")


{-| Comma-separated items (at least one item in the first branch). -}
commaSeparated : Parser a -> Parser (List a)
commaSeparated item =
    oneOf
        [ succeed (\x rest -> x :: rest)
            |= item
            |= loop [] (commaSeparatedStep item)
        , succeed []
        ]


commaSeparatedStep : Parser a -> List a -> Parser (Step (List a) (List a))
commaSeparatedStep item rev =
    oneOf
        [ succeed (\x -> Loop (x :: rev))
            |. symbol ","
            |. mSpaces
            |= item
        , succeed (Done (List.reverse rev))
        ]


{-| @(@ optional comma-separated @item@ list @)@. -}
parenCommaList : Parser a -> Parser (List a)
parenCommaList item =
    succeed identity
        |. symbol "("
        |. mSpaces
        |= oneOf
            [ commaSeparated item
            , succeed []
            ]
        |. mSpaces
        |. symbol ")"
