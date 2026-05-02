module Printer.Html exposing (..)

import Syntax exposing (..)
import Eval exposing (fwd)

import Ui.Model exposing (..)
import Printer.Exp exposing (..)

pxTypeStyleList : List String
pxTypeStyleList = 
    [ "width", "height"
    , "top", "bottom", "left", "right"
    , "margin", "margin-top", "margin-bottom", "margin-left", "margin-right"
    , "padding", "padding-top", "padding-bottom", "padding-left", "padding-right"
    , "border-radius"
    , "border-width", "border-top-width", "border-bottom-width", "border-left-width", "border-right-width" 
    , "font-size"
    ]

intTypeStyleList : List String
intTypeStyleList = 
    [ "z-index", "font-weight", "line-height" ]


intStyleList : List String
intStyleList = pxTypeStyleList ++ intTypeStyleList

colorTypeStyleList : List String
colorTypeStyleList = 
    [ "background-color", "color" ]

printHTML : Exp -> Model -> (String, Model)
printHTML exp model =
    let
        (exp_value, model1) = evalExpToWHNFInRunning exp model 
    in
    case exp_value of
        EHtml _ nodeName style attr childs ->
            if nodeName == "br" then
                ("<br>", model1)
            else
                let
                    (strStyle, model2) =
                        printStyle style model1 
                    
                    formatStyle =
                        case style of
                            ENil _ _ -> ""
                            _      -> " style=\"" ++ strStyle ++ "\""

                    (strAttr, model3) =
                        printAttr attr model2

                    (strChilds, model4) =
                        printChilds childs model3

                    output = 
                        if nodeName == "input" then
                            "<" ++ nodeName ++ formatStyle ++ " " ++ strAttr ++ "/>"
                        else
                            "<" ++ nodeName ++ formatStyle ++ " " ++ strAttr ++ ">" 
                            ++ strChilds ++ "</" ++ nodeName ++ ">"
                in
                    (output, model4)

        _ -> ("Print HTML Error.", model1)


printStyle : Value -> Model -> (String, Model)
printStyle style model =
    let
        (style_value, model1) = evalExpToWHNFInRunning style model 
    in
        case style_value of
            ENil _ _ ->
                ("", model1)

            ECons _ _ x xs ->
                let
                    (str1, model2) =
                        printProperty x model1

                    (str2, model3) =
                        printStyle xs model2
                in
                    (str1 ++ " " ++ str2, model3)
                        
            _              -> 
                ("ERROR #18: Print HTML styles error, styles value = " ++ Debug.toString style_value, model)


printProperty : Value -> Model -> (String, Model)
printProperty pro model =
    let
        (pro_value, model1) = evalExpToWHNFInRunning pro model
    in
        case pro_value of
            ETuple _ TupleType n v ->
                let
                    (n_value, model2) = evalExpToWHNFInRunning n model1
                    (v_value, model3) = evalExpToWHNFInRunning v model2
                    n_str = printStrWithoutQuo n_value
                    v_str = 
                        if List.member n_str intStyleList then
                            case v_value of
                                EInt _ _ -> (print v_value |> removeParens) ++ getUnit(n_str)
                                _        -> 
                                    "ERROR #25: Print HTML int Style Attr Error, name=" ++ n_str
                        else if List.member n_str colorTypeStyleList then
                            case v_value of
                                EInt _ num -> 
                                    let
                                        r = String.fromInt <| modBy 1000000 <| num // 1000000
                                        g = String.fromInt <| modBy 1000 <| num // 1000
                                        b = String.fromInt <| modBy 1000 num 
                                    in
                                    "rgb("++ r ++ " " ++ g ++ " " ++ b ++ ")"
                                _ -> 
                                    "ERROR #26: Incorrect HTML color Style Attr Error, name=" ++ n_str
                        else
                            printStrWithoutQuo v_value
                in                
                    (n_str ++ ":" ++ v_str ++ ";", model3)

            _            -> 
                ("ERROR #19: Print HTML style error, style value = " ++ Debug.toString pro_value, model)
        
        
printAttr : Value -> Model -> (String, Model)
printAttr attr model =
    let
        (attr_value, model1) = evalExpToWHNFInRunning attr model
    in
        case attr_value of
            ENil _ _ ->
                ("", model1)
            
            ECons _ _ x xs   ->
                let
                    (xStr, model2) = printOtherPro x model1
                    (xsStr, model3) = printAttr xs model2
                in                
                    (xStr ++ " " ++ xsStr, model3) 

            _                -> 
                ("ERROR #20: Print HTML attrs error, attrs value = " ++ Debug.toString attr_value, model)


printOtherPro : Value -> Model -> (String, Model)
printOtherPro pro model =
    let
        (pro_value, model1) = evalExpToWHNFInRunning pro model
    in
        case pro_value of
            ETuple _ TupleType n v ->
                let
                    (n_value, model2) = evalExpToWHNFInRunning n model1
                    (v_value, model3) = evalExpToWHNFInRunning v model2
                    n_str = printStrWithoutQuo n_value
                    v_str = 
                        case v_value of
                            EInt _ _ -> (print v_value |> removeParens)
                            EBool _ _ -> print v_value
                            _ -> printStrWithoutQuo v_value
                    v_str_post = 
                        if String.startsWith "on" n_str then
                            "eventForward('" ++ n_str ++ "', '" ++ v_str ++ "', event)"
                        else 
                            v_str
                in
                    (n_str ++ "=\"" ++ v_str_post ++ "\"", model3)

            _ -> 
                ("ERROR #21: Print HTML attr error, attr value = " ++ Debug.toString pro_value, model)


printChilds : Value -> Model -> (String, Model)
printChilds childs model =
    let
        (childs_value, model1) = evalExpToWHNFInRunning childs model
    in    
        case childs_value of
            ENil _ _ ->
                ("", model1)

            ECons _ _ c cs ->
                let
                    (childStr, model2) = printChild c model1
                    (childsStr, model3) = printChilds cs model2
                in                
                    (childStr ++ childsStr, model3)

            _              -> 
                ("ERROR #22: Print HTML childs error, childs value = " ++ Debug.toString childs_value, model)
    

printChild : Value -> Model -> (String, Model)
printChild child model =
    let
        (child_value, model1) = evalExpToWHNFInRunning child model
    in
        case child_value of
            EHtml _ _ _ _ _ -> 
                printHTML child model1

            _ ->
                let
                    (spanType, spanContent) = 
                        case child_value of
                            ECons _ StringType _ _ -> ("str", printStrWithoutQuo child_value)
                            EInt _ _ -> ("int", print child_value |> removeParens)
                            EBool _ _ -> ("bool", print child_value)
                            EChar _ _ -> ("char", print child_value)
                            _ -> ("unsupport", print child_value)
                in
                    ( "<span class='" ++ spanType ++ "'>" ++ spanContent ++ "</span>"
                    , model1
                    )


printStrWithoutQuo : Value -> String
printStrWithoutQuo str_value =
    case str_value of
        ECons _ StringType (EChar _ c) cs -> 
            (String.fromChar c) ++ (printStrWithoutQuo cs) 

        ENil _ StringType -> ""

        _ -> "ERROR #23: Print str error, str value = " ++ Debug.toString str_value


evalExpToWHNFInRunning : Exp -> Model -> (Exp, Model)
evalExpToWHNFInRunning exp model =
    case (fwd model.runningHeap exp model.runningID) of
        Result.Ok (heap_fwd, value, id_fwd) ->
            let
                newModel = 
                    { model | runningHeap = heap_fwd
                            , runningID = id_fwd }   
            in 
                (value, newModel)
        
        Result.Err info ->
            (EError info, model)


getUnit : String -> String
getUnit name =
    if List.member name pxTypeStyleList then    
        "px"
    else if List.member name intTypeStyleList then
        ""
    else 
        "ERROR #27: Unknown name=" ++ name

removeParens : String -> String
removeParens num = 
    String.replace "(" "" num |> String.replace ")" "" 