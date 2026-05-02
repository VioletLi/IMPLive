module Printer.Pattern exposing (..)

import Syntax exposing (..)
import Debug exposing (toString)

print : Pattern -> String
print pat =
    case pat of
        PInt [ws] n ->
            -- <n>[ws]
            (toString n) ++ ws
        
        PBool [ws] b ->
            -- <b>[ws]
            (toString b) ++ ws
        
        PVar [ws] s ->
            -- <s>[ws]
            s ++ ws

        PCons [ws] ConsType s1 s2 ->
            -- <s1>[ws1]::[ws2]<s2>[ws3]
            print s1 ++ 
            "::" ++ ws ++ 
            print s2
        
        PCons [ws] StringType _ _ ->
            -- <s>[ws]
            "\"" ++ list2Str pat ++ "\"" ++ ws

        PTuple [ws1, ws2, ws3] TupleType s1 s2 ->
            -- ([ws1]<s1>[ws2],[ws3]<s2>[ws4])[ws5]
            "(" ++ ws1 ++ 
            print s1 ++ 
            "," ++ ws2 ++ 
            print s2 ++ 
            ")" ++ ws3

        PTuple [ws1] GuiType s1 s2 ->
            -- ([ws1]<s1>[ws2],[ws3]<s2>[ws4])[ws5]
            "Gui" ++ ws1 ++ 
            print s1 ++  
            print s2

        PTuple [ws1] EventType s1 s2 ->
            -- ([ws1]<s1>[ws2],[ws3]<s2>[ws4])[ws5]
            "Event"  ++ ws1 ++ 
            print s1 ++
            print s2
        
        PHtml [ws1, ws2, ws3, ws4] s s1 s2 s3 ->
            "Html." ++ s ++ ws1 ++ 
            print s1 ++ ws2 ++ 
            print s2 ++ ws3 ++ 
            print s3 ++ ws4

        PNil [ws1, ws2] _ ->
            "[" ++ ws1 ++ "]" ++ ws2

        PNil [ws] _ ->
            "\"\""++ ws

        POk [ws] ->
            "_" ++ ws
        
        _ -> 
            "ERROR #13: Print Pattern Error, pattern=" ++ (toString pat)


list2Str : Pattern -> String
list2Str p =
    case p of
        PCons _ _ (PChar _ c) e2 ->
            (String.fromChar c) ++ (list2Str e2)

        PNil _ _ -> ""

        _    -> "ERROR #09: List to String, pattern=" ++ (toString p)