module Printer.Heap exposing (..)

import Syntax exposing (..)
import Printer.Exp as Exp
import Printer.Delta as Delta

print : Heap -> String
print heap =
    case heap of
        (var, ((_, nE), dv, (v, b))) :: heap_ ->
            "{" ++ var ++ "->(" ++ 
            Exp.print nE ++ ", " ++
            Delta.print dv ++ ", " ++
            printValue v ++ ", " ++
            Debug.toString b
            ++ ")" ++
            printHelper heap_ ++ "}"
        
        [] -> "{}"

printHelper : Heap -> String
printHelper heap =
    case heap of
        (var, ((_, nE), dv, (v, b))) :: heap_ ->
            ", " ++ var ++ "->(" ++ 
            Exp.print nE ++ ", " ++
            Delta.print dv ++ ", " ++
            printValue v ++ ", " ++
            Debug.toString b
            ++ ")" ++
            printHelper heap_

        [] -> ""

printValue : Maybe Value -> String
printValue value =
    case value of
        Just value_ -> Exp.print value_
        Nothing -> "_"