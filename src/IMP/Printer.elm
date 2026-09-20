module IMP.Printer exposing (..)

import IMP.Syntax exposing (..)



printStmt : Stmt -> String
printStmt stmt =
    case stmt of
        SSkip [s] ->
            "skip" ++ s

        SSkip _ ->
            "skip "

        SAssign [s] e1 e2 ->
            printExpr e1 ++ ":=" ++ s ++ printExpr e2

        SAssign _ e1 e2 ->
            printExpr e1 ++ " := " ++ printExpr e2

        SRead [s1, s2] x ->
            "read" ++ s1 ++ x ++ s2

        SRead _ x ->
            "read " ++ x ++ " "

        SPrint [s] e ->
            "print" ++ s ++ printExpr e

        SPrint _ e ->
            "print " ++ printExpr e

        SIf [s1, s2, s3, s4] e sThen sElse ->
            "if" ++ s1 ++ printExpr e ++ "then" ++ s2 ++ printStmt sThen
                ++ "else" ++ s3 ++ printStmt sElse ++ "end" ++ s4

        SIf _ e sThen sElse ->
            "if " ++ printExpr e ++ "then " ++ printStmt sThen
                ++ "else " ++ printStmt sElse ++ "end "

        SWhile [s1, s2, s3] e body ->
            "while" ++ s1 ++ printExpr e ++ "do" ++ s2 ++ printStmt body
                ++ "end" ++ s3

        SWhile _ e body ->
            "while " ++ printExpr e ++ "do " ++ printStmt body ++ "end "

        SSeq [s] s1 s2 ->
            printStmt s1 ++ ";" ++ s ++ printStmt s2

        SSeq _ s1 s2 ->
            printStmt s1 ++ "; " ++ printStmt s2

        SError info ->
            info


printExpr : Expr -> String
printExpr expr =
    case expr of
        EInt [s] n ->
            String.fromInt n ++ s

        EInt _ n ->
            String.fromInt n ++ " "

        EBool [s] True ->
            "true" ++ s

        EBool _ True ->
            "true "

        EBool [s] False ->
            "false" ++ s

        EBool _ False ->
            "false "

        EString [s] str ->
            "\"" ++ str ++ "\"" ++ s

        EString _ str ->
            "\"" ++ str ++ "\" "

        EVar [s] x ->
            x ++ s

        EVar _ x ->
            x ++ " "

        EHole [s] h ->
            printHoleExpr h ++ s

        EHole _ h ->
            printHoleExpr h

        ENot [s] e ->
            "!" ++ s ++ printExpr e

        ENot _ e ->
            "!" ++ printExpr e

        EParens [s1, s2] e ->
            "(" ++ s1 ++ printExpr e ++ ")" ++ s2

        EParens _ e ->
            "(" ++ printExpr e ++ ")"

        Eop [s] op e1 e2 ->
            printExpr e1 ++ op ++ s ++ printExpr e2

        Eop _ op e1 e2 ->
            printExpr e1 ++ " " ++ op ++ " " ++ printExpr e2

        EList (sOpen :: rest) es ->
            case List.reverse rest of
                sClose :: commasRev ->
                    "[" ++ sOpen
                        ++ printListBody (List.reverse commasRev) es
                        ++ "]" ++ sClose

                [] ->
                    "[" ++ (List.map printExpr es |> String.join ", ") ++ "]"

        EList _ es ->
            "[" ++ (List.map printExpr es |> String.join ", ") ++ "] "

        EIndex [s1, s2] e1 e2 ->
            printExpr e1 ++ "[" ++ s1 ++ printExpr e2 ++ "]" ++ s2

        EIndex _ e1 e2 ->
            printExpr e1 ++ "[" ++ printExpr e2 ++ "]"

        ELength [s] e ->
            printExpr e ++ ".length" ++ s

        ELength _ e ->
            printExpr e ++ ".length "

        EError info ->
            info


printListBody : List String -> List Expr -> String
printListBody commas es =
    case es of
        [] ->
            ""

        e :: rest ->
            printExpr e ++ printListTail commas rest


printListTail : List String -> List Expr -> String
printListTail commas es =
    case (commas, es) of
        (c :: cs, e :: rest) ->
            "," ++ c ++ printExpr e ++ printListTail cs rest

        (_, e :: rest) ->
            ", " ++ printExpr e ++ printListTail [] rest

        _ ->
            ""


printValue : Value -> String
printValue v =
    case v of
        VInt n ->
            String.fromInt n

        VBool True ->
            "true"

        VBool False ->
            "false"

        VString s ->
            "\"" ++ s ++ "\""

        VHole hn id ->
            "{ " ++ printHoleName hn ++ "@" ++ String.fromInt id ++ " }"

        VList vs ->
            "[" ++ (List.map printValue vs |> String.join ", ") ++ "]"

        VError info ->
            info


printHoleExpr : HoleName -> String
printHoleExpr h =
    case h of
        HOri _ ->
            "_"

        _ ->
            "{ " ++ printHoleName h ++ " }"


printHoleName : HoleName -> String
printHoleName hn =
    case hn of
        HOri n ->
            "#"++(String.fromInt n)

        HVar x ->
            "#"++x

        HTmp ->
            "*"

        HSub h id -> printHoleName h ++ "_" ++ (String.fromInt id)

printHoleBindings : HoleBindings -> String
printHoleBindings hb =
    List.map (\(h, s, v) -> printHoleName h ++ " := " ++ (printStore s) ++ (printValue v)) hb
    |> String.join "\n"

printStore : Store -> String
printStore s =
    "[" ++ (List.map (\(x, v) -> x ++ " := " ++ printValue v) s |> String.join ", ") ++ "] \n"


printOutput : Store -> String
printOutput store =
    printValue (outputValue store)


outputValue : Store -> Value
outputValue store =
    case store of
        ( "output", v ) :: _ ->
            v

        _ :: rest ->
            outputValue rest

        [] ->
            VList []

-- printIO : IO -> String
-- printIO io =
--     "input: [" ++ (List.map printValue (getIO io "input") |> String.join ", ") ++ "]\n output: [" ++ (List.map printValue (getIO io "output") |> String.join ", ") ++ "] \n"