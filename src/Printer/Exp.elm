module Printer.Exp exposing (..)


import Syntax exposing (..)
import Debug exposing (toString)
import Printer.Pattern as Pattern
-- import Printer.Html exposing (printHTML)


print : Exp -> String
print exp =
    case exp of
        EParens [ws1, ws2] e ->  "(" ++ ws1 ++ print e ++ ")" ++ ws2

        EInt [ws] n  ->
            if n < 0 then
                "(" ++ (toString n) ++ ")" ++ ws
            else
                (toString n) ++ ws

        EBool [ws] b ->
            (toString b) ++ ws

        EChar _ c ->
            toString c

        EUPrim [ws] op e ->
            let sop = case op of
                    Not -> "!"
                    Neg -> "-"
            in sop ++ ws ++ (print e)

        EVar [ws] var  _ ->
            var ++ ws

        ELam [ws1, ws2, ws3] par body ->
            "\\" ++ ws1 ++
            par ++ ws2 ++
            "->" ++ ws3 ++
            (print body)

        EApp e1 e2 ->
            print e1 ++ print e2

        ELet [ws1, ws2] [] body ->
            "let" ++ ws1 ++ "∅ in" ++ ws2 ++ print body

        ELet wss ((var, ((_, nE), _, _))::decls) body ->
            let
                maybeSplitedDeclWSS = splitLetWSS wss
            in
                case maybeSplitedDeclWSS of
                    Just (ws1, (declWS1, declWS2, declWSS), ws2) ->
                        "let" ++ ws1 ++
                        var ++ declWS1 ++
                        "=" ++ declWS2 ++
                        print nE ++
                        printDecls declWSS decls ++
                        "in" ++ ws2 ++
                        print body

                    Nothing -> "ERROR #14: Print Let Exp Error, let-exp=" ++ (toString exp)

        ECons [ws] StringType _ _ ->
            "\"" ++ list2Str exp ++ "\"" ++ ws

        ECons _ _ (EChar _ _) _ ->
            "\"" ++ list2Str exp ++ "\" "

        ENil [ws] StringType ->
            "\"\"" ++ ws
        
        ENil [] StringType ->
            "\"\" "

        ECons [ws] ConsType e1 e2 ->
            print e1 ++
            "::" ++ ws ++
            print e2

        ECons [ws] SquareType e1 e2 ->
            "," ++ ws ++
            print e1 ++
            print e2

        ECons [ws1, ws2] SquareType e1 e2 ->
            "[" ++ ws1 ++
            print e1 ++
            print e2 ++
            "]" ++ ws2

        ETuple [ws1, ws2, ws3] TupleType e1 e2 ->
            "(" ++ ws1 ++
            print e1 ++
            "," ++ ws2 ++
            print e2 ++
            ")" ++ ws3
        
        ETuple [ws] GuiType e1 e2 ->
            "Gui" ++ ws ++
            print e1 ++
            print e2
        
        ETuple [ws] EventType e1 e2 ->
            "Event"  ++ ws ++
            print e1 ++
            print e2

        ENil [] _->
            ""

        ENil [ws1, ws2] _ ->
            "[" ++ ws1 ++ "]" ++ ws2

        EHtml [ws] s e1 e2 e3 ->
            "Html." ++ s ++ ws ++
            print e1 ++
            print e2 ++
            print e3

        ECase [ws1, ws2] e branch ->
            "case" ++ ws1 ++
            print e ++
            "of" ++ ws2 ++
            printBranch branch

        EBPrim [ws] op e1 e2 ->
            let
                sop =
                    case op of
                        Add -> "+"
                        Sub -> "-"
                        Mul -> "*"
                        -- Div -> " / "
                        Mod -> "%"
                        Cat -> "++"
                        Eq  -> "=="
                        Ne  -> "!="
                        Lt  -> "<"
                        Gt  -> ">"
                        Le  -> "<="
                        Ge  -> ">="
                        And -> "&&"
                        Or  -> "||"
            in
                print e1 ++
                sop ++ ws ++
                print e2

        EError info ->
            info

        _ -> "ERROR #08: Print Exp Error, exp=" ++ (toString exp)

        -- _ ->
        --     let _ = Debug.log "exp" exp in
        --     "ERROR #08: Print Expressions."


printDecls : WSS -> Heap -> String
printDecls wss declarations =
    case (wss, declarations) of
        (ws1::ws2::ws3::wssTail, (var, ((_, nE), _, _)) :: decls) ->
            "," ++ ws1 ++
            var ++ ws2 ++
            "=" ++ ws3 ++
            print nE ++
            printDecls wssTail decls

        ([], []) ->
            ""

        _ ->
            "ERROR #15: Print Let Exp Declaration Error, declarations=" ++ (toString declarations) ++
            " wss=" ++ (toString wss)


printBranch : Branch -> String
printBranch branch =
    case branch of
        BSin [ws] p e ->
            (Pattern.print p) ++
            "->" ++ ws ++
            print e

        BCom [ws] b1 b2 ->
            (printBranch b1) ++
            "|" ++ ws ++
            (printBranch b2)

        _ -> "ERROR #16: Print Case Exp Branch Error, branch=" ++ (toString branch)


list2Str : Exp -> String
list2Str exp =
    case exp of
        ECons _ _ (EChar _ c) e2 ->
            (String.fromChar c) ++ (list2Str e2)

        ENil _ _ -> ""

        _    -> "ERROR #09: List to String, exp=" ++ (toString exp)


splitLetWSS : WSS -> Maybe (String, (String, String, WSS), String)
splitLetWSS wss =
    case wss of
        ws1::declWS1::declWS2::wss3 ->
            listLast wss3 |> Maybe.andThen (
                \ws2 ->
                    let
                        declWSS = List.take ((List.length wss3) - 1) wss3
                    in
                        Just (ws1, (declWS1, declWS2, declWSS), ws2)
            )
        _ -> Nothing

listLast : List a -> Maybe a
listLast xs =
    case xs of
        [] -> Nothing
        x::[] -> Just x
        _::ys -> listLast ys
