module NewParser.Utils exposing (..)

import Char
import Set exposing (Set)
import Parser exposing (..)
import NewParser.WhiteSpace exposing (mSpaces)
import NewSyntax exposing (Value(..))


{-| Keywords reserved for commands / declarations (not valid variable names). -}
reservedNames : Set String
reservedNames =
    Set.fromList
        [ "fun"
        , "if"
        , "then"
        , "else"
        , "while"
        , "do"
        , "skip"
        , "return"
        , "True"
        , "False"
        , "true"
        , "false"
        , "Html"
        , "skip"
        , "len"
        ]


{-| Length of a runtime list (@VNil@ / @VCons@ spine). -}
arrayLenValue : Value -> Result String Int
arrayLenValue v =
    let
        go n w =
            case w of
                VNil ->
                    Ok n

                VCons _ t ->
                    go (n + 1) t

                _ ->
                    Err "len: expected list value"
    in
    go 0 v


{-| Zero-based cell from a list-shaped @Value@. -}
arrayGetAt : Int -> Value -> Result String Value
arrayGetAt i spine =
    if i < 0 then
        Err "array index must be non-negative"

    else
        let
            go j s =
                case s of
                    VNil ->
                        Err "array index out of bounds"

                    VCons h t ->
                        if j == 0 then
                            Ok h

                        else
                            go (j - 1) t

                    _ ->
                        Err "indexed read: expected list value"
        in
        go i spine


{-| Update nested indices (outermost first); @newVal@ replaces the cell at the path. -}
arrayUpdatePath : List Int -> Value -> Value -> Result String Value
arrayUpdatePath path newVal spine =
    case path of
        [] ->
            Err "array assign: empty index path"

        [ i ] ->
            replaceHeadAt i newVal spine

        i :: rest ->
            arrayGetAt i spine
                |> Result.andThen
                    (\inner ->
                        arrayUpdatePath rest newVal inner
                            |> Result.andThen (\inner2 -> replaceHeadAt i inner2 spine)
                    )


replaceHeadAt : Int -> Value -> Value -> Result String Value
replaceHeadAt i newHead spine =
    if i < 0 then
        Err "array index must be non-negative"

    else if i == 0 then
        case spine of
            VCons _ t ->
                Ok (VCons newHead t)

            VNil ->
                Err "array index out of bounds"

            _ ->
                Err "array assign: expected list value"

    else
        case spine of
            VCons h t ->
                replaceHeadAt (i - 1) newHead t
                    |> Result.map (\t2 -> VCons h t2)

            VNil ->
                Err "array index out of bounds"

            _ ->
                Err "array assign: expected list value"


varName : Parser String
varName =
    variable
        { start = Char.isAlpha
        , inner = \c -> Char.isAlphaNum c || c == '_'
        , reserved = reservedNames
        }


{-| Double-quoted string without escapes (same spirit as @Parser.Utils.mstring@). -}
mstring : Parser String
mstring =
    getChompedString (chompUntil "\"")


{-| Comma-separated items (at least one item in the first branch). -}
commaSeparated : Parser a -> Parser (List a)
commaSeparated item =
    oneOf
        [ succeed (\x rest -> x :: rest)
            |= item
            |= loop [] (commaSeparatedStep item)
        , succeed []
        ]


commaSeparatedStep : Parser a -> List a -> Parser (Step (List a) (List a))
commaSeparatedStep item rev =
    oneOf
        [ succeed (\x -> Loop (x :: rev))
            |. symbol ","
            |. mSpaces
            |= item
        , succeed (Done (List.reverse rev))
        ]


{-| @(@ optional comma-separated @item@ list @)@. -}
parenCommaList : Parser a -> Parser (List a)
parenCommaList item =
    succeed identity
        |. symbol "("
        |. mSpaces
        |= oneOf
            [ commaSeparated item
            , succeed []
            ]
        |. mSpaces
        |. symbol ")"
