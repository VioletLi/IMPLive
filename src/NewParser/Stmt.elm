module NewParser.Stmt exposing (..)

import Parser exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)
import NewParser.Utils exposing (varName)
import NewParser.Pattern exposing (pat)
import NewParser.Comp exposing (atomicComp, comp)
import NewSyntax exposing (..)


stmt : Parser Stmt
stmt =
    oneOf
        [ backtrackable funDef
        , map StmtComp comp
        ]


funDef : Parser Stmt
funDef =
    succeed (\ws1 fn ws2 ps ws3 ws4 body -> StmtFun [ws1, ws2, ws3, ws4] fn ps body)
        |. keyword "fun"
        |= mSpaces
        |= varName
        |. symbol "("
        |= mSpaces
        |= pat
        |. symbol ")"
        |= mSpaces
        |. symbol "="
        |= mSpaces
        |= lazy (\_ -> atomicComp)
