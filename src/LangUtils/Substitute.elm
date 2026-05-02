module LangUtils.Substitute exposing (..)


import Syntax exposing (..)

-- | Substitute variable name @s1@ in @exp@ for @s2@
substExp : Exp -> Var -> Var -> Exp
substExp exp s1 s2 =
    case exp of
        EParens wss e ->
            EParens wss (substExp e s1 s2)

        EVar wss s _ ->
            if s == s1 then
                EVar wss s2 0
            else
                exp

        ELam wss par1 body ->
            if par1 == s1 then
                exp
            else
                ELam wss par1 (substExp body s1 s2)

        EApp fun arg ->
            EApp (substExp fun s1 s2) (substExp arg s1 s2)

        ELet wss decls body ->
            ELet wss (substDecls decls s1 s2) (substExp body s1 s2)

        ECons wss lType e1 e2 ->
            ECons wss lType (substExp e1 s1 s2) (substExp e2 s1 s2)

        ETuple wss tType e1 e2 ->
            ETuple wss tType (substExp e1 s1 s2) (substExp e2 s1 s2)

        EHtml wss s e1 e2 e3 ->
            EHtml wss s (substExp e1 s1 s2) (substExp e2 s1 s2) (substExp e3 s1 s2)

        ECase wss guard branch ->
            let
                guard_ =
                    substExp guard s1 s2

                branch_ =
                    substBranch branch s1 s2
            in
                ECase wss guard_ branch_

        EUPrim wss op e ->
            EUPrim wss op (substExp e s1 s2)

        EBPrim wss op e1 e2 ->
            EBPrim wss op (substExp e1 s1 s2) (substExp e2 s1 s2)

        _ -> exp


substDecls : Heap -> Var -> Var -> Heap
substDecls declarations s1 s2 =
    case declarations of
        (var1, ((oE, nE), dv, flag)) :: decls ->
            let var = if var1 == s1 then s2 else var1 in
            (var, ((substExp oE s1 s2, substExp nE s1 s2), dv, flag)) ::
            (substDecls decls s1 s2)

        _ -> []


substSet : Exp -> List (Var, Var) -> Exp
substSet ei renamedvars =
    case renamedvars of
        (s1, s2) :: renamedvars_ ->
            let
                ei_ =
                    substSet ei renamedvars_
            in
                substExp ei_ s1 s2

        _ ->
            ei


substBranch : Branch -> Var -> Var -> Branch
substBranch branch s1 s2 =
    case branch of
        BSin wss p exp ->
            if containsVar s1 p then
                branch
            else
                BSin wss p (substExp exp s1 s2)

        BCom wss b1 b2 ->
            BCom wss (substBranch b1 s1 s2) (substBranch b2 s1 s2)


containsVar : Var -> Pattern -> Bool
containsVar s1 p =
    case p of
        PVar _ s ->
            s == s1

        PTuple _ _ p1 p2 ->
            containsVar s1 p1 || containsVar s1 p2

        PCons _ _ p1 p2 ->
            containsVar s1 p1 || containsVar s1 p2

        _ -> False