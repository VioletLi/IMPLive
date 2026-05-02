module Printer.Delta exposing (..)

import Syntax exposing (..)
import Debug exposing (toString)
import Printer.Exp as Exp

print : Delta -> String
print dv =
    case dv of
        DZero -> "??"

        DId -> "id"

        DRem -> "remove"

        DAdd n ->
            "+" ++ toString n

        DTuple dv1 dv2 ->
            "(" ++ print dv1 ++ ", " ++ print dv2 ++ ")"

        DInsert n e ->
            "insert " ++ toString n ++ " " ++ Exp.print e

        DDelete n ->
            "delete " ++ toString n

        DCons _ dv1 dv2 ->
            print dv1 ++ "::" ++ print dv2
        
        DHtml s dv1 dv2 dv3 ->
            "html " ++ s ++ " " ++ print dv1 ++ " " ++ print dv2 ++ " " ++ print dv3

        DLam e dv1 ->
            "\\" ++ Exp.print e ++ "->" ++ print dv1

        DCom dv1 dv2 ->
            "(" ++ print dv1 ++ "." ++ print dv2 ++ ")"