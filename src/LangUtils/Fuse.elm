module LangUtils.Fuse exposing (..)

import Syntax exposing (..)
import Printer.Delta exposing (..)
import Tuple exposing (mapFirst)

-- | Transform a delta into a function as an expression in the core language and wrap it in EParens
deltaToFun : Delta -> ID -> (Exp, ID)
deltaToFun dv id = mapFirst (EParens eParensDefaultWSS) <|
    case dv of
        DZero -> (ELam eLamDefaultWSS "x" (EVar eVarDefaultWSS "x"  0), id)
        DId   -> (ELam eLamDefaultWSS "x" (EVar eVarDefaultWSS "x"  0), id)

        DAdd n ->
            -- let (var, id1) = freshName "F" id in
            (ELam eLamDefaultWSS "x"
            (EBPrim eBPrimDefaultWSS Add (EVar eVarDefaultWSS "x" 0) (EInt eIntDefaultWSS n)), id)

        DTuple dv1 dv2 ->
            let
                (fst, id1)    = deltaToFun_ dv1 id  "fst"
                (snd, id2)    = deltaToFun_ dv2 id1 "snd"
            in
                (ELam eLamDefaultWSS "x" <|
                (ECase eCaseDefaultWSS (EVar eVarDefaultWSS "x" 0)
                (BSin bSinDefaultWSS (PTuple pTupleDefaultWSS TupleType (pV "fst") (pV "snd"))
                (ETuple eTupleDefaultWSS TupleType fst snd))), id2)

        DCons mv dv1 dv2 ->
            case mv of
                Just e ->
                    let
                        (tl, id2) = deltaToFun_ dv2 id "x"
                    in
                        (ELam eLamDefaultWSS "x" <|
                        (ECons eConsDefaultWSS ConsType e tl), id2)
                Nothing ->
                    let
                        (hd, id1) = deltaToFun_ dv1 id  "hd"
                        (tl, id2) = deltaToFun_ dv2 id1 "tl"
                    in
                    if dv1 == DRem 
                    then
                        (ELam eLamDefaultWSS "x" <|
                        (ECase eCaseDefaultWSS (EVar eVarDefaultWSS "x" 0)
                        (BSin bSinDefaultWSS (PCons pConsDefaultWSS ConsType (pV "hd") (pV "tl"))
                        tl)), id2)
                    else
                        (ELam eLamDefaultWSS "x" <|
                        (ECase eCaseDefaultWSS (EVar eVarDefaultWSS "x" 0)
                        (BSin bSinDefaultWSS (PCons pConsDefaultWSS ConsType (pV "hd") (pV "tl"))
                        (ECons eConsDefaultWSS ConsType hd tl))), id2)

        DHtml s dv1 dv2 dv3 ->
            let
                (style, id1) = deltaToFun_  dv1 id  "style"
                (attr,  id2) = deltaToFun_ dv2 id1 "attr"
                (child, id3) = deltaToFun_  dv3 id2 "child"
            in
                (ELam eLamDefaultWSS "x" <| (ECase eCaseDefaultWSS (EVar eVarDefaultWSS "x" 0)
                (BSin bSinDefaultWSS (PHtml pHtmlDefaultWS s (pV "style") (pV "attr") (pV "child")) 
                (EHtml eHtmlDefaultWSS s style attr child))), id3)

        DCom dv1 dv2 ->
            let
                -- (var, id3) = freshName "F" id2
                (f1, id1) = deltaToFun_ dv1 id  "x"
                (f2, id2) = deltaToFun_ dv2 id1 "x"
                e1 =
                    case f2 of
                        ELam _ _ _ -> EApp f2 (EVar eVarDefaultWSS "x" 0)
                        _          -> f2
            in
                case f1 of
                    EVar _ _ _         -> (ELam eLamDefaultWSS "x" <| e1, id2)
                    ELam _ _ _         -> (ELam eLamDefaultWSS "x" <| EApp f1 e1, id2)
                    EBPrim wss op _ e2 -> (ELam eLamDefaultWSS "x" <| EBPrim wss op e1 e2, id2)
                    EApp _ _           -> (ELam eLamDefaultWSS "x" <| EApp f1 e1, id2)
                    _                  -> (EError <| "(666transFun-error on " ++ Debug.toString dv ++ "777) " ++ Debug.toString f1, id)

        _     -> (EError <| "(transFun-error on " ++ Debug.toString dv ++ ")", id)

deltaToFun_ : Delta -> ID -> Var -> (Exp, ID)
deltaToFun_ dv id var =
    case dv of
        DZero  -> (EVar eVarDefaultWSS var 0, id)
        DId    -> (EVar eVarDefaultWSS var 0, id)
        DAdd n -> (EBPrim eBPrimDefaultWSS Add (EVar eVarDefaultWSS var 0) (EInt eIntDefaultWSS n), id)
        _      ->
            let
                (fun, id1) = deltaToFun dv id
            in
                (EApp fun (EVar eVarDefaultWSS var 0), id1)

-- | Normalise any composed deltas to remove DZero
simplify : Delta -> Delta
simplify dv =
    case dv of
        DCom DZero dv2 -> simplify dv2
        DCom dv1 DZero -> simplify dv1
        DCom DId dv2   -> simplify dv2
        DCom dv1 DId   -> simplify dv1
        DCom dv1 dv2   -> DCom (simplify dv1) (simplify dv2)

        DTuple dv1 dv2 ->
            case (simplify dv1, simplify dv2) of
                (DZero, DZero) -> DZero
                (DZero, DId)   -> DId
                (DId, DZero)   -> DId
                (DId, DId)     -> DId
                (dv1_, dv2_)   -> DTuple dv1_ dv2_
        
        DCons mv dv1 dv2 ->
            case mv of
                Nothing ->
                    case (simplify dv1, simplify dv2) of
                        (DZero, DZero) -> DZero
                        (DZero, DId)   -> DId
                        (DId, DZero)   -> DId
                        (DId, DId)     -> DId
                        (dv1_, dv2_)   -> DCons mv dv1_ dv2_
                _ ->
                    DCons mv (simplify dv1) (simplify dv2)

        DHtml s dv1 dv2 dv3 ->
            case (simplify dv1, simplify dv2, simplify dv3) of
                (DZero, DZero, DZero) -> DZero
                (DZero, DZero, DId)   -> DId
                (DZero, DId, DZero)   -> DId
                (DId, DZero, DZero)   -> DId
                (DZero, DId, DId)     -> DId
                (DId, DZero, DId)     -> DId
                (DId, DId, DZero)     -> DId
                (DId, DId, DId)       -> DId
                (dv1_, dv2_, dv3_)    -> DHtml s dv1_ dv2_ dv3_

        dv_            -> dv_


pV : String -> Pattern
pV v = PVar pVarDefaultWSS v