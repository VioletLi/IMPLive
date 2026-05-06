module NewParser.Comp exposing (atomicComp, comp)

import Parser exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)
import NewParser.Utils exposing (varName)
import NewParser.Exp exposing (exp, commaSeparatedExp, indexedAtom)
import NewSyntax exposing (..)


{-| After @lhs@ … @=@ … : try @f(es)@ → @CAssignCall@, else @e@ → @CAssign@.
    @lhs@ is an indexed atom (@EVar@ or @EIndex@ …); other shapes are rejected in the evaluator.
    @eqWss@ is @[ wsBeforeEquals, wsAfterEquals ]@ around @=@.
-}
assignAfterEquals : Exp -> String -> String -> Parser Comp
assignAfterEquals lhs wsBeforeEq wsAfterEq =
    oneOf
        [ backtrackable
            (succeed (\f ws1 ws2 -> CAssignCall [ wsBeforeEq, wsAfterEq, ws1, ws2 ] lhs f (ENil []))
                |= varName
                |. symbol "("
                |= mSpaces
                |. symbol ")"
                |= mSpaces
            )
        , backtrackable
            (succeed (\f ws1 args ws2 -> CAssignCall [ wsBeforeEq, wsAfterEq, ws1, ws2 ] lhs f args)
                |= varName
                |. symbol "("
                |= mSpaces
                |= commaSeparatedExp (lazy (\_ -> exp))
                |. symbol ")"
                |= mSpaces
            )
        , succeed (CAssign [ wsBeforeEq, wsAfterEq ] lhs)
            |= lazy (\_ -> exp)
        ]


{-| Indexed-atom left-hand side, then @=@ … → @CAssign@ or @CAssignCall@. -}
assign : Parser Comp
assign =
    indexedAtom
        |> andThen
            (\lhs ->
                succeed (\wsBeforeEq wsAfterEq -> ( wsBeforeEq, wsAfterEq ))
                    |= mSpaces
                    |. symbol "="
                    |= mSpaces
                    |> andThen (\( wb, wa ) -> assignAfterEquals lhs wb wa)
            )


{-| One @CompSeq@ spine: @atomicComp@ then optional @; …@ (like @commaSeparatedExp@ / @ECons@).
Singleton @STail c@ flattens to bare @c@; two or more commands become @CSeq spine@.
-}
comp : Parser Comp
comp =
    lazy (\_ -> seq atomicComp)

seq : Parser Comp -> Parser Comp
seq compP =
    compP
        |> andThen
            (\first ->
                oneOf
                    [ succeed (\ws rest -> CSeq [ ws ] first rest)
                        |. symbol ";"
                        |= mSpaces
                        |= lazy (\_ -> seq compP)
                    , succeed first
                    ]
            )


atomicComp : Parser Comp
atomicComp =
    oneOf
        [ backtrackable skipComp
        , backtrackable returnComp
        , backtrackable ifComp
        , backtrackable whileComp
        , backtrackable assign
        ]


skipComp : Parser Comp
skipComp =
    succeed (\ws -> CSkip [ ws ])
        |. keyword "skip"
        |= mSpaces


returnComp : Parser Comp
returnComp =
    succeed (\ws e -> CReturn [ ws ] e)
        |. keyword "return"
        |= mSpaces
        |= lazy (\_ -> exp)


ifComp : Parser Comp
ifComp =
    succeed (\ws1 e ws2 t ws3 f -> CIf [ ws1, ws2, ws3 ] e t f)
        |. keyword "if"
        |= mSpaces
        |= lazy (\_ -> exp)
        |. keyword "then"
        |= mSpaces
        |= lazy (\_ -> comp)
        |. keyword "else"
        |= mSpaces
        |= lazy (\_ -> comp)


whileComp : Parser Comp
whileComp =
    succeed (\ws1 e ws2 body -> CWhile [ ws1, ws2 ] e body)
        |. keyword "while"
        |= mSpaces
        |= lazy (\_ -> exp)
        |. keyword "do"
        |= mSpaces
        |= lazy (\_ -> comp)
