module NewParser.WhiteSpace exposing (..)

import Parser exposing (..)


{-| Greedy run of spaces, tabs, newlines (layout text for @WSS@ slots). -}
mSpaces : Parser String
mSpaces =
    getChompedString (chompWhile isWhiteSpace)


isWhiteSpace : Char -> Bool
isWhiteSpace c =
    c == ' ' || c == '\n' || c == '\r' || c == '\t'
