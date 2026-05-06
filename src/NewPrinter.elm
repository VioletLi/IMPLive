module NewPrinter exposing (printProgram, printStmt, printComp, printExp, printPat, printValue)

{-| Pretty-print @NewSyntax@ with @WSS@ layouts fixed by @NewParser@.
    If @WSS@ shape does not match the parser, the result is an @"Error in …"@ string naming the printer entrypoint.
-}

import NewSyntax exposing (Bop(..), Comp(..), Exp(..), Pat(..), Stmt(..), Value(..))


printProgram : List Stmt -> String
printProgram stmts =
    String.join "" (List.map printStmt stmts)


{-| Human-readable runtime value (not tied to parser @WSS@). -}
printValue : Value -> String
printValue v =
    case v of
        VInt n ->
            String.fromInt n

        VBool True ->
            "True"

        VBool False ->
            "False"

        VString s ->
            "\"" ++ s ++ "\""

        VUnit ->
            ""

        VNil ->
            "[]"

        VCons h t ->
            "[" ++ printListSpine h t ++ "]"

        VHole u _ ->
            "⟨hole " ++ u ++ "⟩"

        VHtml tag av pv cv ->
            "Html." ++ tag ++ " " ++ printValue av ++ " " ++ printValue pv ++ " " ++ printValue cv

        VError msg ->
            msg


printListSpine : Value -> Value -> String
printListSpine h t =
    case t of
        VNil ->
            printValue h

        VCons h2 t2 ->
            printValue h ++ ", " ++ printListSpine h2 t2

        _ ->
            "Error in printListSpine: tail after list cell must be VNil or VCons"


{-| @NewParser.Stmt.funDef@ — @StmtFun [ ws1, ws2, ws3, ws4 ]@. -}
printStmt : Stmt -> String
printStmt s =
    case s of
        StmtFun [ ws1, ws2, ws3, ws4 ] fn pat body ->
            "fun"
                ++ ws1
                ++ fn
                ++ "("
                ++ ws2
                ++ printPat pat
                ++ ")"
                ++ ws3
                ++ "="
                ++ ws4
                ++ printComp body

        StmtComp c ->
            printComp c

        _ ->
            "Error in printStmt"


{-| @NewParser.Pattern@ -}
printPat : Pat -> String
printPat p =
    case p of
        PVar [ ws ] name ->
            name ++ ws

        PNil [ ws ] ->
            ws

        PCons [ ws ] p1 p2 ->
            printPat p1 ++ "," ++ ws ++ printPat p2

        _ ->
            "Error in printPat"


{-| @NewParser.Comp@ -}
printComp : Comp -> String
printComp c =
    case c of
        CSkip [ ws ] ->
            "skip" ++ ws

        CAssign [ wb, wa ] lhs rhs ->
            printExp lhs ++ wb ++ "=" ++ wa ++ printExp rhs

        CAssignCall [ wb, wa, w1, w2 ] lhs fname args ->
            printExp lhs ++ wb ++ "=" ++ wa ++ fname ++ "(" ++ w1 ++ printCommaArgs args ++ ")" ++ w2

        CSeq [ ws ] c1 c2 ->
            printComp c1 ++ ";" ++ ws ++ printComp c2

        CIf [ w1, w2, w3 ] g th el ->
            "if"
                ++ w1
                ++ printExp g
                ++ "then"
                ++ w2
                ++ printComp th
                ++ "else"
                ++ w3
                ++ printComp el

        CWhile [ w1, w2 ] g body ->
            "while" ++ w1 ++ printExp g ++ "do" ++ w2 ++ printComp body

        CReturn [ ws ] e ->
            "return" ++ ws ++ printExp e

        _ ->
            "Error in printComp"


{-| @commaSeparatedExp@ -}
printCommaArgs : Exp -> String
printCommaArgs e =
    case e of
        ENil [] ->
            ""

        ECons [ w ] h t ->
            printExp h ++ "," ++ w ++ printCommaArgs t

        eOther ->
            printExp eOther


{-| @commaSeparatedListSpine@ inside @EList@ -}
printListPayload : Exp -> String
printListPayload payload =
    case payload of
        ENil [] ->
            ""

        ECons [] h (ENil []) ->
            printExp h

        ECons [ w ] h rest ->
            printExp h ++ "," ++ w ++ printListPayload rest

        eOther ->
            printExp eOther


printExp : Exp -> String
printExp e =
    case e of
        EError info ->
            "error \"" ++ info ++ "\""

        EInt [ ws ] n ->
            String.fromInt n ++ ws

        EBool [ ws ] True ->
            "True" ++ ws

        EBool [ ws ] False ->
            "False" ++ ws

        EString [ ws ] s ->
            "\"" ++ s ++ "\"" ++ ws

        EVar [ ws ] x ->
            x ++ ws

        EIndex [ wOpen, wClose ] base idx ->
            printExp base ++ "[" ++ wOpen ++ printExp idx ++ "]" ++ wClose

        ELen [ wIn, wOut ] arg ->
            "len(" ++ wIn ++ printExp arg ++ ")" ++ wOut

        EList [ wOpen, wClose ] payload ->
            "[" ++ wOpen ++ printListPayload payload ++ "]" ++ wClose

        ENil [ws] ->
            ws

        ECons [ w ] h t ->
            printExp h ++ "," ++ w ++ printEConsTail t

        EBPrim [ ws ] op l r ->
            printExp l ++ printBop op ++ ws ++ printExp r

        EParens [ w1, w2 ] inner ->
            "(" ++ w1 ++ printExp inner ++ ")" ++ w2

        EHole [ ws ] _ ->
            "_" ++ ws

        EHtml [ ws ] tag a1 a2 a3 ->
            "Html." ++ tag ++ ws ++ printExp a1 ++ printExp a2 ++ printExp a3

        _ ->
            "Error in printExp"


printEConsTail : Exp -> String
printEConsTail t =
    case t of
        ENil [ws] ->
            ws

        ECons [ w ] h rest ->
            printExp h ++ "," ++ w ++ printEConsTail rest


        eOther ->
            printExp eOther


printBop : Bop -> String
printBop op =
    case op of
        Add ->
            "+"

        Sub ->
            "-"

        Append ->
            "++"

        Mul ->
            "*"

        Div ->
            "/"

        Mod ->
            "%"

        Eq ->
            "=="

        Ne ->
            "!="

        Lt ->
            "<"

        Gt ->
            ">"

        Le ->
            "<="

        Ge ->
            ">="

        And ->
            "&&"

        Or ->
            "||"
