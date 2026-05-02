module Parser.WhiteSpace exposing (..)

import Parser exposing (..)


mSpaces : Parser String
mSpaces =
    getChompedString (chompWhile isWhiteSpace)

    
isWhiteSpace : Char -> Bool
isWhiteSpace c =
    c == ' ' || c == '\n' || c == '\r' || c == '\t'