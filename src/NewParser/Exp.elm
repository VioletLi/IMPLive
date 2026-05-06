module NewParser.Exp exposing (commaSeparatedExp, exp, indexedAtom, parse)

import Parser exposing (Parser, (|.), (|=), symbol, keyword, end, lazy, oneOf, succeed, backtrackable, map, andThen, number, DeadEnd, run, loop, Step(..))
import Parser.Expression exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)
import NewParser.Utils exposing (varName, mstring)
import NewSyntax exposing (..)


parse : String -> Result (List DeadEnd) Exp
parse =
    run (exp |. end)


exp : Parser Exp
exp =
    buildExpressionParser operators (lazy (\_ -> indexedAtom))


{-| Postfix @[ i ]@ … chains (arrays as @VCons@ lists); base comes from @atom@. -}
indexedAtom : Parser Exp
indexedAtom =
    atom |> andThen (\start -> loop start indexedAtomStep)


indexedAtomStep : Exp -> Parser (Step Exp Exp)
indexedAtomStep e =
    oneOf
        [ backtrackable
            (succeed (\wsOpen idx wsClose -> Loop (EIndex [ wsOpen, wsClose ] e idx))
                |. symbol "["
                |= mSpaces
                |= lazy (\_ -> exp)
                |. symbol "]"
                |= mSpaces
            )
        , succeed (Done e)
        ]


operators : OperatorTable Exp
operators =
    [ [ Infix (bop "*" Mul) AssocLeft
      , Infix (bop "/" Div) AssocLeft
      , Infix (bop "%" Mod) AssocLeft
      ]
    , [ Infix (bop "++" Append) AssocRight
      , Infix (bop "+" Add) AssocLeft
      , Infix (bop "-" Sub) AssocLeft
      ]
    , [ Infix (bop "<=" Le) AssocNone
      , Infix (bop ">=" Ge) AssocNone
      , Infix (bop "<" Lt) AssocNone
      , Infix (bop ">" Gt) AssocNone
      ]
    , [ Infix (bop "==" Eq) AssocNone
      , Infix (bop "!=" Ne) AssocNone
      ]
    , [ Infix (bop "&&" And) AssocLeft ]
    , [ Infix (bop "||" Or) AssocLeft ]
    ]


bop : String -> Bop -> Parser (Exp -> Exp -> Exp)
bop s op =
    succeed (\ws e1 e2 -> EBPrim [ ws ] op e1 e2)
        |. symbol s
        |= mSpaces


{-| Branches that may consume input then fail need @backtrackable@ so @oneOf@ can fall through (cf. empty @listExp@ vs non-empty). -}
atom : Parser Exp
atom =
    oneOf
        [ backtrackable htmlExp
        , lenExp
        , holeExp
        , intExp
        , boolExp
        , backtrackable stringExp
        , backtrackable listExp
        , backtrackable parensExp
        , varExp
        ]


{-| Builtin @len(e)@ — not a user-defined @fun@. -}
lenExp : Parser Exp
lenExp =
    succeed (\ws1 arg ws2 -> ELen [ ws1, ws2 ] arg)
        |. keyword "len"
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> exp)
        |. symbol ")"
        |= mSpaces


htmlExp : Parser Exp
htmlExp =
    succeed (\tag ws a1 a2 a3 -> EHtml [ ws ] tag a1 a2 a3)
        |. keyword "Html"
        |. symbol "."
        |= varName
        |= mSpaces
        |= lazy (\_ -> exp)
        |= lazy (\_ -> exp)
        |= lazy (\_ -> exp)


holeExp : Parser Exp
holeExp =
    succeed (\ws -> EHole [ ws ] defaultHoleName)
        |. symbol "_"
        |= mSpaces


intExp : Parser Exp
intExp =
    succeed (\n ws -> EInt [ ws ] n)
        |= number
            { int = Just identity
            , hex = Nothing
            , octal = Nothing
            , binary = Nothing
            , float = Nothing
            }
        |= mSpaces


boolExp : Parser Exp
boolExp =
    oneOf
        [ succeed (\ws -> EBool [ ws ] True)
            |. keyword "True"
            |= mSpaces
        , succeed (\ws -> EBool [ ws ] False)
            |. keyword "False"
            |= mSpaces
        , succeed (\ws -> EBool [ ws ] True)
            |. keyword "true"
            |= mSpaces
        , succeed (\ws -> EBool [ ws ] False)
            |. keyword "false"
            |= mSpaces
        ]


stringExp : Parser Exp
stringExp =
    succeed (\s ws -> EString [ ws ] s)
        |. symbol "\""
        |= mstring
        |. symbol "\""
        |= mSpaces


commaSeparatedExp : Parser Exp -> Parser Exp
commaSeparatedExp expP =
    expP
        |> andThen
            (\first ->
                oneOf
                    [ succeed (\ws rest -> ECons [ ws ] first rest)
                        |. symbol ","
                        |= mSpaces
                        |= lazy (\_ -> commaSeparatedExp expP)
                    , succeed first
                    ]
            )


{-| Like @commaSeparatedExp@ but forces a nil-terminated spine: @ECons … (ECons en (ENil []))@.
    Used only for @[ … ]@; call-form @f(es)@ keeps @commaSeparatedExp@ so unary calls stay a bare @exp@.
-}
commaSeparatedListSpine : Parser Exp -> Parser Exp
commaSeparatedListSpine expP =
    expP
        |> andThen
            (\first ->
                oneOf
                    [ succeed (\ws rest -> ECons [ ws ] first rest)
                        |. symbol ","
                        |= mSpaces
                        |= lazy (\_ -> commaSeparatedListSpine expP)
                    , succeed (ECons [] first (ENil []))
                    ]
            )


{-| @[ ]@ — @EList … (ENil [])@; @[ e1 , … , en ]@ — @EList … spine@ where @spine@ is @ECons@ chain ending in @ENil []@.
    @(@ @)@ for grouping is only @EParens@; parenthesized comma tuples use @commaSeparatedExp@ under @CAssignCall@ only.
-}
listExp : Parser Exp
listExp =
    oneOf
        [ backtrackable
            (succeed (\wsOpen wsClose -> EList [ wsOpen, wsClose ] (ENil []))
                |. symbol "["
                |= mSpaces
                |. symbol "]"
                |= mSpaces
            )
        , succeed (\wsOpen spine wsClose -> EList [ wsOpen, wsClose ] spine)
            |. symbol "["
            |= mSpaces
            |= commaSeparatedListSpine (lazy (\_ -> exp))
            |. symbol "]"
            |= mSpaces
        ]


{-| @(@ single @exp@ @)@ — not comma-separated (that exists only under @CAssignCall@). -}
parensExp : Parser Exp
parensExp =
    succeed (\ws1 e ws2 -> EParens [ ws1, ws2 ] e)
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> exp)
        |. symbol ")"
        |= mSpaces


varExp : Parser Exp
varExp =
    succeed (\v ws -> EVar [ ws ] v)
        |= varName
        |= mSpaces
