module IMP.Test exposing (..)

import IMP.Parser_ exposing (parse)
import IMP.Eval exposing (exec, defaultFwdRes, FwdRes)
import IMP.Uneval exposing (unexec)
import IMP.Printer exposing (..)
import IMP.Syntax exposing (..)
import IMP.Utils exposing (preprocessStmt)
import Set exposing (Set)


-- emptyIO : IO
-- emptyIO =
--     [("input", []), ("output", [])]


fwd : String -> FwdRes
fwd code =
    case parse code of
        Ok stmt ->
            let (stmt_, _) = preprocessStmt stmt 0 in
            exec [] [] [] stmt_ Set.empty 0

        Err _ ->
            { defaultFwdRes | store = [("error", VError "Parse error")] }


bwd : String -> Store -> RiStmts -> String
bwd code newstore newris =
    case parse code of
        Ok stmt ->
            let
                (stmt_, hcount) = preprocessStmt stmt 0 
                res =
                    unexec [] [] [] Set.empty stmt_ hcount 0 (newstore, newris)
            in
            (printStmt res.stmt) ++ "\n\n" ++ (printHoleBindings res.holeBindings)

        Err _ ->
            "Parse error"
