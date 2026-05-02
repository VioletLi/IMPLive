module LangUtils.WHNF exposing (..)

import Syntax exposing (..)

isWHNF : Exp -> Bool
isWHNF exp =
    case exp of
        EInt _ _        -> True
        EBool _ _       -> True
        EChar _ _       -> True
        ELam _ _ _      -> True
        ECons _ _ _ _   -> True
        ENil _ _        -> True
        ETuple _ _ _ _  -> True
        EHtml _ _ _ _ _ -> True
        EError _        -> True
        _               -> False