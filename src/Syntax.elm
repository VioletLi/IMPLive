module Syntax exposing (..)


type alias ID = Int
type alias Var = String
type alias Info = String

{- | Heap
        = [(variable name
        , (original exp, updated exp)
        , delta
        , (memorized val, if the fully updated exp has already been computed)))]
-}
type alias Heap = List (Var, ((Exp, Exp), Delta, (Maybe Value, Bool)))

-- | Value = Exps in WHNF (ELam, EInt, ENil, and ETuple & ECons that contain only Values)
type alias Value = Exp

{- type and constants about whitespace -}
type alias WSS = List String

type ListType = ConsType | SquareType | StringType
type TupleType = TupleType | GuiType | EventType

eParensDefaultWSS : List String
eParensDefaultWSS = [""," "]
eIntDefaultWSS : WSS
eIntDefaultWSS = [" "]
eBoolDefaultWSS : WSS
eBoolDefaultWSS = [" "]
eStringDefaultWSS : WSS
eStringDefaultWSS = [" "]
eVarDefaultWSS : WSS
eVarDefaultWSS = [" "]
eLamDefaultWSS : WSS
eLamDefaultWSS = ["", " ", " "]
eLetDefaultWSS : WSS
eLetDefaultWSS = [" ", " "]
eConsDefaultWSS : WSS
eConsDefaultWSS = [" "]
eListDefaultWSS : WSS
eListDefaultWSS = [" ", " "]
eNilDefaultWSS : WSS
eNilDefaultWSS = ["", " "]
eTupleDefaultWSS : WSS
eTupleDefaultWSS = [" ", " ", " "]
eTupleEventDefaultWSS : WSS
eTupleEventDefaultWSS = [" "]
eCaseDefaultWSS : WSS
eCaseDefaultWSS = [" ", " "]
eUPrimDefaultWSS : WSS
eUPrimDefaultWSS = [" "]
eBPrimDefaultWSS : WSS
eBPrimDefaultWSS = [" "]
eHtmlDefaultWSS : WSS
eHtmlDefaultWSS = [" "]
bSinDefaultWSS : WSS
bSinDefaultWSS = [" "]
bComDefaultWSS : WSS
bComDefaultWSS = [" "]

pConsDefaultWSS : WSS
pConsDefaultWSS = [" "]
pTupleDefaultWSS : WSS
pTupleDefaultWSS = ["", " ", " "]
pHtmlDefaultWS : WSS
pHtmlDefaultWS = [" ", " ", " ", " "]

pVarDefaultWSS : WSS
pVarDefaultWSS = [" "]

type Exp
    = EInt   WSS Int
    | EBool  WSS Bool
    | EChar  WSS Char
    | EParens WSS Exp
    | EVar   WSS Var Int -- ^ Variable name, and the length of the delta difference that has been calculated so far
    | ELam   WSS Var Exp
    | EApp   Exp Exp
    | ELet   WSS Heap Exp -- constructor arguments, let-body
    | ECons  WSS ListType Exp Exp
    | ENil   WSS ListType
    | ETuple WSS TupleType Exp Exp
    | ECase  WSS Exp Branch
    | EUPrim WSS Uop Exp
    | EBPrim WSS Bop Exp Exp
    -- Html.div [("position", "relative")] [("id", "div1")] ["test"]
    | EHtml  WSS String Exp Exp Exp
    -- | EEvent WSS 
    | EError Info

type Bop = Add | Sub | Mul -- | Div
        | Mod | Cat
        | Eq  | Ne | Lt  | Gt  | Le  | Ge
        | And | Or

type Uop = Not | Neg

type Branch
    = BSin WSS Pattern Exp
    | BCom WSS Branch Branch

type Pattern
    = PInt   WSS Int
    | PBool  WSS Bool
    | PChar  WSS Char
    | PCons  WSS ListType Pattern Pattern
    | PTuple WSS TupleType Pattern Pattern
    | PHtml  WSS String Pattern Pattern Pattern
    | PVar   WSS Var
    | PNil   WSS ListType
    | POk    WSS

type Delta
    = DZero
    | DRem
    | DId
    | DAdd Int
    | DTuple Delta Delta
    | DInsert Int Value
    | DDelete Int
    | DCons (Maybe Exp) Delta Delta
    | DLam Exp Delta
    | DCom Delta Delta   -- dv2 . dv1, where dv1 is the first delta being applied
    | DHtml String Delta Delta Delta


type GUIEvent 
    = Click
    | Input String 