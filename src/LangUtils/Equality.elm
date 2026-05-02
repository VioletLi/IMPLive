module LangUtils.Equality exposing (..)

import Syntax exposing (..)

eqExp : Exp -> Exp -> Bool
eqExp exp1 exp2 = case (exp1, exp2) of
    (EParens _ e1, e2) ->
        eqExp e1 e2
    (e1, EParens _ e2) ->
        eqExp e1 e2
    (EInt _ n1, EInt _ n2) ->
        n1 == n2
    (EBool _ b1, EBool _ b2) ->
        b1 == b2
    (EChar _ c1, EChar _ c2) ->
        c1 == c2
    (EVar _ x _, EVar _ y _) ->
        x == y
    (ELam _ _ e1, ELam _ _ e2) ->
        eqExp e1 e2
    (EApp ef1 e1, EApp ef2 e2) ->
        eqExp ef1 ef2 && eqExp e1 e2
    (ELet _ decls1 e1, ELet _ decls2 e2) ->
        eqDecls decls1 decls2 && eqExp e1 e2
    (ECons _ _ ehd1 etl1, ECons _ _ ehd2 etl2) ->
        eqExp ehd1 ehd2 && eqExp etl1 etl2
    (ENil _ _, ENil _ _) ->
        True
    (EHtml _ s1 e1 e2 e3, EHtml _ s2 e4 e5 e6) ->
        s1 == s2 && eqExp e1 e4 && eqExp e2 e5 && eqExp e3 e6
    (ETuple _ _ e1a e1b, ETuple _ _ e2a e2b) ->
        eqExp e1a e2a && eqExp e1b e2b
    (ECase _ e1 br1, ECase _ e2 br2) ->
        eqExp e1 e2 && eqBranch br1 br2
    (EUPrim _ op1 e1, EUPrim _ op2 e2) ->
        op2 == op1 && eqExp e1 e2
    (EBPrim _ bop1 e1a e1b, EBPrim _ bop2 e2a e2b) ->
        bop2 == bop1 && eqExp e1a e2a && eqExp e1b e2b
    _ ->
        False

eqBranch : Branch -> Branch -> Bool
eqBranch br1 br2 = case (br1, br2) of
    (BSin _ p1 e1, BSin _ p2 e2) ->
        p1 == p2 && eqExp e1 e2
    (BCom _ br1a br1b, BCom _ br2a br2b) ->
        eqBranch br1a br2a && eqBranch br1b br2b
    _ -> False

eqDecls : Heap -> Heap -> Bool
eqDecls decls1 decls2 = case (decls1, decls2) of
    ((var1, ((_, nE1), _, _)) :: decls1_, (var2, ((_, nE2), _, _)) :: decls2_) ->
        var1 == var2 && eqExp nE1 nE2 && eqDecls decls1_ decls2_
    ([], []) ->
        True
    _ ->
        False
