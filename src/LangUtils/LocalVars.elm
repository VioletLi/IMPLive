module LangUtils.LocalVars exposing (..)

import Syntax exposing (..)
import Utils exposing (lookup)

localVarsToDeclExp : Exp -> Heap -> Exp
localVarsToDeclExp exp heap =
    ELet eLetDefaultWSS (localVarsToDecl (localVars exp) heap) exp

localVars : Exp -> List Var
localVars exp =
    case exp of
        EParens _ e ->
            localVars e

        EVar _ x _ ->
            if String.startsWith "R" x || String.startsWith "I" x
            then [x]
            else []
        
        ELam _ _ e ->
            localVars e
        
        EApp e1 e2 ->
            localVars e1 ++ localVars e2
        
        ELet _ decls e ->
            List.concatMap (\(_, ((_, nE), _, _)) -> localVars nE) decls ++ localVars e
        
        ECons _ _ e1 e2 ->
            localVars e1 ++ localVars e2
        
        EHtml _ _ e1 e2 e3 ->
            localVars e1 ++ localVars e2 ++ localVars e3
        
        ETuple _ _ e1 e2 ->
            localVars e1 ++ localVars e2

        ECase _ e br ->
            localVars e ++ localVarsBranch br
        
        EUPrim _ _ e ->
            localVars e
        
        EBPrim _ _ e1 e2 ->
            localVars e1 ++ localVars e2

        _ -> []

localVarsBranch : Branch -> List Var
localVarsBranch br =
    case br of
        BSin _ _ e ->
            localVars e
        
        BCom _ b1 b2 ->
            localVarsBranch b1 ++ localVarsBranch b2


localVarsToDecl : List Var -> Heap -> Heap
localVarsToDecl vars heap =
    case vars of
        [] -> []
        x::xs ->
            case lookup x heap of
                Just binding -> (x, binding) :: localVarsToDecl xs heap
                Nothing      -> localVarsToDecl xs heap