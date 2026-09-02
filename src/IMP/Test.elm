module IMP.Test exposing (..)

import IMP.Parser_ exposing (parse)
import IMP.Eval exposing (exec, defaultFwdRes, FwdRes)
import IMP.Uneval exposing (unexec)
import IMP.Printer exposing (..)
import IMP.Syntax exposing (..)
import IMP.Utils exposing (preprocessStmt)
import Set exposing (Set)


emptyIO : IO
emptyIO =
    [("input", []), ("output", [])]


fwd : String -> IO -> FwdRes
fwd code io =
    case parse code of
        Ok stmt ->
            let (stmt_, _) = preprocessStmt stmt 0 in
            exec [] io [] [] stmt_ Set.empty 0

        Err _ ->
            { defaultFwdRes | store = [("error", VError "Parse error")] }


bwd : String -> IO -> Store -> RiStmts -> IO -> String
bwd code io newstore newris newio =
    case parse code of
        Ok stmt ->
            let
                (stmt_, hcount) = preprocessStmt stmt 0 
                res =
                    unexec [] io [] [] Set.empty stmt_ hcount 0 (newstore, newris, newio)
            in
            (printStmt res.stmt) ++ "\n\n" ++ (printHoleBindings res.holeBindings)

        Err _ ->
            "Parse error"
