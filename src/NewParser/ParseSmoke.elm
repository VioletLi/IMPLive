module NewParser.ParseSmoke exposing (parseComp, parseExp, parseProgram, parseStmt)

{-| REPL / `elm make` smoke targets for @NewParser@ + @NewSyntax@.

Build (checks that new parser modules compile):

    elm make src/NewParser/ParseSmoke.elm --output=/dev/null

In `elm repl` (from @incompleteOOP@):

    import NewParser.ParseSmoke exposing (..)
    parseExp "1 + 2"
    parseProgram "fun f() = skip x := 1"

Or import parsers directly: @NewParser.Program@, @NewParser.Exp@, etc.
-}

import Parser exposing (DeadEnd, run, end, (|.))

import NewParser.Program as Program
import NewParser.Exp as Exp
import NewParser.Comp as Comp
import NewParser.Stmt as StmtMod
import NewSyntax as Syn


parseProgram : String -> Result (List DeadEnd) Syn.Program
parseProgram =
    Program.parse


parseExp : String -> Result (List DeadEnd) Syn.Exp
parseExp =
    Exp.parse


{-| Single imperative command (consumes full input). -}
parseComp : String -> Result (List DeadEnd) Syn.Comp
parseComp =
    run (Comp.comp |. end)


{-| One top-level statement (@fun@ or @comp@ block). -}
parseStmt : String -> Result (List DeadEnd) Syn.Stmt
parseStmt =
    run (StmtMod.stmt |. end)
