module OOP.TestEvaluator exposing (..)

import OOP.Parser.Program exposing (parse)
import OOP.Syntax exposing (..)
import OOP.LangUtils exposing (processAfterParse)
import OOP.Preclude.Gui exposing (parsedGui,assemble)
import OOP.Eval exposing (eval,errEvalRes)
import OOP.Printer.Value exposing (printValue)
import OOP.LangUtils exposing (processCTAfterParse)

test : String -> (EvalRes, String)
test prog =
    case parse prog of
        Result.Ok (NoCT t) ->
            let
                (t_, _) = processAfterParse t 0
                res =
                    eval [] [] [] parsedGui t_ []
            in
            ( res, printValue res.res )

        Result.Ok (WithCT ctb t) ->
            let
                (ctb_, holeID) = processCTAfterParse ctb
                (t_, _) = processAfterParse t holeID
                withGui =
                        assemble ctb_
                res =
                    eval [] [] [] withGui t_ []
            in
            ( res, printValue res.res )

        _ ->
            ( errEvalRes "Parse Error", "" )

