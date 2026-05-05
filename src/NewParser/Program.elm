module NewParser.Program exposing (..)

import Parser exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)
import NewParser.Stmt exposing (stmt)
import NewSyntax as Syn


parse : String -> Result (List DeadEnd) Syn.Program
parse =
    run (program |. end)


{-| Ordered @stmt@ list: @fun ... = atomicComp@ entries, then @comp@ (@c1; c2; ...@, @x := e@, etc.). -}
program : Parser Syn.Program
program =
    stmts


stmts : Parser (List Syn.Stmt)
stmts =
    loop [] stmtsStep


stmtsStep : List Syn.Stmt -> Parser (Step (List Syn.Stmt) (List Syn.Stmt))
stmtsStep rev =
    oneOf
        [ succeed (\s -> Loop (s :: rev))
            |= stmt
        , succeed (Done (List.reverse rev))
        ]
