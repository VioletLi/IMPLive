module NewParser.Pattern exposing (pat)

import Parser exposing (..)
import String
import NewParser.WhiteSpace exposing (mSpaces)
import NewParser.Utils exposing (varName)
import NewSyntax exposing (..)


{-| Non-empty: @PCons (PVar x) (PVar y)@ / nested @PCons@ — **no** trailing @PNil@. Empty @f()@: @PNil@ only. -}
pat : Parser Pat
pat =
    oneOf
        [ backtrackable patChain
        , emptyPatParams
        ]



patChain : Parser Pat
patChain =
    pVarSegment
        |> andThen
            (\first ->
                oneOf
                    [ succeed (\wsAfterComma rest -> PCons [ wsAfterComma ] first rest)
                        |. symbol ","
                        |= mSpaces
                        |= lazy (\_ -> patChain)
                    , succeed first
                    ]
            )


pVarSegment : Parser Pat
pVarSegment =
    succeed (\name ws -> PVar [ ws ] name)
        |= varName
        |= mSpaces


{-| Optional space then @)@ ahead (without consuming @)@) → @PNil@. -}
emptyPatParams : Parser Pat
emptyPatParams =
    succeed (\wsOnly offset src -> ( wsOnly, offset, src ))
        |= mSpaces
        |= getOffset
        |= getSource
        |> andThen
            (\( wsOnly, offset, src ) ->
                if nextCharIsCloseParen offset src then
                    succeed (PNil [ wsOnly ])

                else
                    problem "Expected ')' or a parameter name after '('"
            )


nextCharIsCloseParen : Int -> String -> Bool
nextCharIsCloseParen offset src =
    String.dropLeft offset src
        |> String.uncons
        |> Maybe.map (\( c, _ ) -> c == ')')
        |> Maybe.withDefault False
