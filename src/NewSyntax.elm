module NewSyntax exposing (..)

{-| Imperative core + top-level bindings + Elm-style Html / gui main.

  Intended surface shape (informal):

    fun add(model, ...) = ...
    initmodel := ...
    controller := [ add ]
    view := Html.div [] ...
    main := gui(initmodel, controller, view)

  @EHtml@ uses the same three-expression shape as @Syntax.EHtml@: attributes list,
  properties list, children list (parser builds the list-valued @Exp@s).
-}


type alias Var =
    String


type alias HoleName =
    String


type alias FunName =
    String


type alias Info =
    String


{-| Default hole label placeholder (for eval / codegen). -}
defaultHoleName : String
defaultHoleName = "-1"


{-| Whitespace / layout slots between tokens (same idea as @Syntax.elm@). -}
type alias WSS = List String



{- ---------- default WSS ---------- -}

eIntDefaultWSS : WSS
eIntDefaultWSS =
    [ " " ]


eBoolDefaultWSS : WSS
eBoolDefaultWSS =
    [ " " ]


eStringDefaultWSS : WSS
eStringDefaultWSS =
    [ " " ]


eVarDefaultWSS : WSS
eVarDefaultWSS =
    [ " " ]


eNilDefaultWSS : WSS
eNilDefaultWSS =
    [ "", " " ]


eConsDefaultWSS : WSS
eConsDefaultWSS =
    [ " " ]


eListDefaultWSS : WSS
eListDefaultWSS =
    [ " ", " " ]


eBPrimDefaultWSS : WSS
eBPrimDefaultWSS =
    [ " " ]


eParensDefaultWSS : WSS
eParensDefaultWSS =
    [ "", " " ]


eHoleDefaultWSS : WSS
eHoleDefaultWSS =
    [ " " ]


eHtmlDefaultWSS : WSS
eHtmlDefaultWSS =
    [ " " ]


pVarDefaultWSS : WSS
pVarDefaultWSS =
    [ " " ]


pNilDefaultWSS : WSS
pNilDefaultWSS =
    [ "", " " ]


pConsDefaultWSS : WSS
pConsDefaultWSS =
    [ " " ]


cSkipDefaultWSS : WSS
cSkipDefaultWSS =
    [ " " ]


cAssignDefaultWSS : WSS
cAssignDefaultWSS =
    [ " ", " " ]


cAssignCallDefaultWSS : WSS
cAssignCallDefaultWSS =
    [ " ", " " ]


cSeqDefaultWSS : WSS
cSeqDefaultWSS =
    [ " " ]


cIfDefaultWSS : WSS
cIfDefaultWSS =
    [ " ", " ", " " ]


cWhileDefaultWSS : WSS
cWhileDefaultWSS =
    [ " ", " " ]


cReturnDefaultWSS : WSS
cReturnDefaultWSS =
    [ " " ]


funDefDefaultWSS : WSS
funDefDefaultWSS =
    [ " ", " ", " " ]


{-| Expressions: pure values only — user calls use @CAssignCall@ except builtin @len(e)@ (@ELen@).
@EList … payload@ — nil-terminated @ECons@ spine; @EIndex@ is postfix @[ … ]@ on lists (runtime @VCons@/@VNil@).
-}
type Exp
    = EInt WSS Int
    | EBool WSS Bool
    | EString WSS String
    | EVar WSS Var
    | EIndex WSS Exp Exp
    | ELen WSS Exp
    | EList WSS Exp
    | ENil WSS
    | ECons WSS Exp Exp
    | EBPrim WSS Bop Exp Exp
    | EParens WSS Exp
    | EHole WSS HoleName
    | EHtml WSS String Exp Exp Exp
    | EError Info


type Bop
    = Add
    | Sub
    | Append
    | Mul
    | Div
    | Mod
    | Eq
    | Ne
    | Lt
    | Gt
    | Le
    | Ge
    | And
    | Or


{-| @p@ — parameter / pattern (parameter lists are @List Pat@ on @FunDef@). -}
type Pat
    = PVar WSS Var
    | PNil WSS
    | PCons WSS Pat Pat


{-| @c@ — computations.
    @CAssign@ / @CAssignCall@ left-hand sides are @Exp@ (indexed atoms: @EVar@ or @EIndex@ …).
    The evaluator rejects any other expression form on the left.
-}
type Comp
    = CSkip WSS
    | CAssign WSS Exp Exp
    | CAssignCall WSS Exp FunName Exp
    | CSeq WSS Comp Comp
    | CIf WSS Exp Comp Comp
    | CWhile WSS Exp Comp
    | CReturn WSS Exp


{-| Top-level: @fun@ definitions and imperative @comp@ blocks (@c1; c2; ...@, @x := e@, etc.). -}
type Stmt
    = StmtFun WSS FunName Pat Comp
    | StmtComp Comp


{-| Full program: ordered statements (@fun@ / @comp@). -}
type alias Program = List Stmt


{-| @v@ — runtime values. -}
type Value
    = VInt Int
    | VBool Bool
    | VString String
    | VUnit
    | VNil
    | VCons Value Value
    | VHole HoleName Store
    | VHtml String Value Value Value
    | VError Info


{-| @σ@ — store @x ↦ v@. -}
type alias Store =
    List ( Var, Value )


{-| @Γ@ — function environment @f ↦ (pats, c)@. -}
type alias FunEnv =
    List ( FunName, Pat, Comp )


{-| @Σ@ — hole bindings @(u, σ) ↦ v@. -}
type alias HoleBindings =
    List ( HoleName, Store, Value )
