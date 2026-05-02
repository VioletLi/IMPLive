module LangUtils.GUI exposing (..)

import Syntax exposing (..)
import Parser.Utils exposing (repWS)
import Printer.Exp exposing (print)
import Html exposing (option)
import Html exposing (..)
import Html.Attributes as Attr

eventToExp : String -> List String -> Exp
eventToExp eventNameStr args =
    let
        eventNameExpr = strToExpr eventNameStr
        argsExpr = argsToExp args
    in 
        ETuple eTupleEventDefaultWSS EventType eventNameExpr argsExpr


eventExpToStr : Exp -> String
eventExpToStr eventExp =
    case eventExp of
        ETuple _ EventType eventNameExpr _ ->
            String.replace "\"" "" <| print eventNameExpr

        _ -> "Error #24: Unknown Event Exp, exp=" ++ Debug.toString eventExp


strToExpr : String -> Exp
strToExpr str =
    str |> String.toList >>
    List.foldr (\c acc -> ECons [" "] StringType (EChar [] c) acc) (ENil [] StringType)
    |> repWS eStringDefaultWSS


strToBool : String -> Maybe Bool
strToBool str =
    case str of
        "True"  -> Just True
        "False" -> Just False
        _       -> Nothing  

argsToExp : List String -> Exp
argsToExp ss =
    let
        argToExp s =
            case String.toInt s of
                Just intValue -> EInt eIntDefaultWSS intValue

                Nothing -> 
                    case strToBool s of
                        Just boolValue -> EBool eBoolDefaultWSS boolValue

                        Nothing -> strToExpr s 
    in

    List.foldr 
        (\s acc -> ECons eConsDefaultWSS SquareType (argToExp s) acc) 
        (ENil [] SquareType)
        ss
    |> repWS eListDefaultWSS


dropLast : List a -> List a
dropLast xs =
    case xs of 
        []      -> []
        x :: [] -> []
        x :: ys -> x :: (dropLast ys)

makeSelectListForEvents : Int -> List (Exp, Delta) -> List (Html msg)
makeSelectListForEvents currentEventIndex events =
    List.indexedMap 
        (
            \i e -> 
                let
                    eventStr = eventExpToStr <| Tuple.first e
                    star = 
                        case Tuple.second e of
                            DZero -> ""
                            _     -> " ⭐"   

                    indexStr = String.fromInt i 
                    t = eventStr ++ star
                    attrList = 
                        if i == currentEventIndex then
                            [ Attr.value indexStr, Attr.selected True ]
                        else 
                            [ Attr.value indexStr ]
                in
                    option 
                        attrList
                        [text t]
        )
        events