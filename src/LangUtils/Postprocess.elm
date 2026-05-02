module LangUtils.Postprocess exposing (..)

import Syntax exposing (..)
import Utils exposing (lookup)

postprocess : Exp -> Heap -> Exp
postprocess exp h =
    case exp of
        EVar wss x _   ->
            if String.startsWith "D" x || String.startsWith "I" x || String.startsWith "R" x
            then case lookup x h of
                Just ((_, e2), _, _) -> (postprocess e2 h)
                Nothing              -> EVar wss x 0
            else
                EVar wss x 0
        ETuple wss TupleType e1 e2  ->
            ETuple wss TupleType (postprocess (removeParens e1) h) (postprocess (removeParens e2) h)
        ETuple wss tType e1 e2  ->
            ETuple wss tType (postprocess e1 h) (postprocess e2 h)
        ECons wss ltype e1 e2 ->
            case ltype of
                SquareType ->
                    ECons wss ltype (postprocess (removeParens e1)  h) (postprocess (removeParens e2)  h)
                _          ->
                    ECons wss ltype (postprocess e1 h) (postprocess e2 h)

        EParens wss e ->
            EParens wss (postprocess e h)
        ELam wss x e ->
            ELam wss x (postprocess e h)
        EApp e1 e2 ->
            EApp (postprocess e1 h) (postprocess e2 h)
        ELet wss h_ e ->
            ELet  wss (postprocessHeap h_ h) (postprocess e h)
        ECase wss e b ->
            ECase wss (postprocess e h) (postprocessBranch b h)
        EUPrim wss u e     ->
            EUPrim wss u (postprocess e h)
        EBPrim wss b e1 e2 ->
            EBPrim wss b (postprocess e1 h) (postprocess e2 h)
        EHtml wss s e1 e2 e3 ->
            EHtml wss s (postprocess e1 h) (postprocess e2 h) (postprocess e3 h)

        _ -> exp

removeParens : Exp -> Exp
removeParens exp = case exp of
    EParens _ e -> e
    _           -> exp

postprocessHeap : Heap -> Heap -> Heap
postprocessHeap h h1 =
    case h of
        (x, ((_, nE), _, _))::h_ ->
            let exp = postprocess nE h1 in
            (x, ((exp, exp), DZero, (Nothing, False)))::(postprocessHeap h_ h1)
        [] -> []


postprocessBranch : Branch -> Heap -> Branch
postprocessBranch b h =
    case b of
        BSin wss p e   -> BSin wss p (postprocess e h)
        BCom wss b1 b2 -> BCom wss (postprocessBranch b1 h) (postprocessBranch b2 h)