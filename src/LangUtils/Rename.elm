module LangUtils.Rename exposing (..)


import Syntax exposing (..)
import Debug exposing (toString)
import LangUtils.Substitute exposing (substSet, substDecls)


renameExp : Exp -> ID -> (Exp, ID, List (Var, Var))
renameExp exp id =
    case exp of
        EParens wss e ->
            let
                (e_, id_, renameSet) =
                    renameExp e id
            in
                (EParens wss e_, id_, renameSet)
        ELam wss par body ->
            let
                (body_, id_, renameSet) =
                    renameExp body id
            in
                (ELam wss par body_, id_, renameSet)

        EApp fun arg ->
            let
                (fun_, id_, renameSet) =
                    renameExp fun id
            in
                (EApp fun_ arg, id_, renameSet)

        ELet wss decls body ->
            let
                (decls1, id1, renameSet1) =
                    renameDecls decls id

                decls2 =
                    List.foldl (\(s1, s2) -> \decls_ ->
                        substDecls decls_ s1 s2
                    ) decls1 renameSet1

                body1 =
                    substSet body renameSet1

                (body2, id2, renameSet2) =
                    renameExp body1 id1
            in
                (ELet wss decls2 body2, id2, renameSet1 ++ renameSet2)

        ECons wss lType e1 e2 ->
            let
                (e1_, id1, renameSet1) =
                    renameExp e1 id

                (e2_, id2, renameSet2) =
                    renameExp e2 id1
            in
                (ECons wss lType e1_ e2_, id2, renameSet1 ++ renameSet2)

        EHtml wss s e1 e2 e3 ->
            let
                (e1_, id1, renameSet1) =
                    renameExp e1 id

                (e2_, id2, renameSet2) =
                    renameExp e2 id1

                (e3_, id3, renameSet3) =
                    renameExp e3 id2
            in
                (EHtml wss s e1_ e2_ e3_, id3, renameSet1 ++ renameSet2 ++ renameSet3)

        ETuple wss tType e1 e2 ->
            let
                (e1_, id1, renameSet1) =
                    renameExp e1 id

                (e2_, id2, renameSet2) =
                    renameExp e2 id1
            in
                (ETuple wss tType e1_ e2_, id2, renameSet1 ++ renameSet2)

        ECase wss guard branch ->
            let
                (guard_, id1, renameSet1) =
                    renameExp guard id

                (branch_, id2, renameSet2) =
                    renameBranch branch id1
            in
                (ECase wss guard_ branch_, id2, renameSet1 ++ renameSet2)

        EUPrim wss op e ->
            let
                (e_, id1, renameSet1) =
                    renameExp e id

            in
                (EUPrim wss op e_, id1, renameSet1)

        EBPrim wss op e1 e2 ->
            let
                (e1_, id1, renameSet1) =
                    renameExp e1 id

                (e2_, id2, renameSet2) =
                    renameExp e2 id1
            in
                (EBPrim wss op e1_ e2_, id2, renameSet1 ++ renameSet2)

        _ ->
            (exp, id, [])


renameDecls : Heap -> ID -> (Heap, ID, List (Var, Var))
renameDecls declarations id =
    case declarations of
        (var, (binding, dv, flag)) :: decls ->
            let
                (y, id1) = freshName "i" id

                (decls_, id_, renameSet1) =
                    renameDecls decls id1

                declarations_ =
                    (y, (binding, dv, flag)) :: decls_
            in
                (declarations_, id_, (var, y) :: renameSet1)

        [] ->
            ([], id, [])


renameBranch : Branch -> ID -> (Branch, ID, List (Var, Var))
renameBranch branch id =
    case branch of
        BSin wss p e ->
            let
                (e_, id_, renameSet) =
                    renameExp e id
            in
                (BSin wss p e_, id_, renameSet)

        BCom wss b1 b2 ->
            let
                (b1_, id1, renameSet1) =
                    renameBranch b1 id

                (b2_, id2, renameSet2) =
                    renameBranch b2 id1
            in
                (BCom wss b1_ b2_, id2, renameSet1 ++ renameSet2)

freshName : String -> ID -> (Var, ID)
freshName x id = (x ++ toString id, id + 1)