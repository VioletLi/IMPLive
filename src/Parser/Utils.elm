module Parser.Utils exposing (..)

import Set
import Dict exposing (Dict)
import List exposing (..)
import Parser exposing (..)
import Syntax exposing (..)

varName : Parser String
varName =
    variable
    { start = Char.isAlpha
    , inner = \c -> Char.isAlphaNum c || c == '_'
    , reserved = Set.fromList <|
        [ "let"
        , "in"
        , "case"
        , "of"
        , "id"
        , "True"
        , "False"
        , "Html"
        , "Gui"
        , "Event"
        ]
    }


mstring : Parser String
mstring = 
    getChompedString (chompUntil "\"")


-- diff : List Char -> List Char -> (Int, Delta)
-- diff v1 v2 =
--     case (v1, v2) of
--         ([], _) -> (length v2, List.foldr (\c -> DCons (Just (EChar [] c)) DId) DId v2)
--         (_, []) -> (length v1, List.foldr (\_ -> DCons Nothing DRem)            DId v1)
--         (x::xs, y::ys) ->
--             if x == y then
--                 let 
--                     (n, opList) = diff xs ys
--                 in
--                     (n, DCons Nothing DId opList)
--             else
--                 let
--                     (n1, ops1) = diff xs v2
--                     (n2, ops2) = diff v1 ys
--                 in
--                     if n1 < n2 then
--                         (1 + n1, DCons Nothing DRem ops1)
--                     else
--                         (1 + n2, DCons (Just (EChar [] y)) DId ops2)


diff : List Char -> List Char -> ( Int, Delta )
diff v1 v2 =
    let
        memo : Dict ( (List Char), (List Char) ) ( Int, Delta )
        memo =
            Dict.empty
    in
    diffMemo memo v1 v2 |> Tuple.first


diffMemo : Dict ( (List Char), (List Char) ) ( Int, Delta ) -> List Char -> List Char -> (( Int, Delta ),  Dict ( (List Char), (List Char) ) ( Int, Delta ))
diffMemo memo v1 v2 =
    case Dict.get ( (v1, v2) ) memo of
        Just result ->
            (result, memo)

        Nothing ->
            case ( v1, v2 ) of
                ( [], _ ) ->
                    let
                        result =
                            ( length v2, foldr ( \c -> DCons ( Just ( EChar [] c ) ) DId ) DId v2 )
                    in
                    ( result, Dict.insert ( (v1, v2) ) result memo)

                ( _, [] ) ->
                    let
                        result =
                            ( length v1, foldr ( \_ -> DCons Nothing DRem ) DId v1 )
                    in
                    ( result, Dict.insert ( (v1, v2) ) result memo )

                ( x :: xs, y :: ys ) ->
                    if x == y then
                        let
                            ( ( n, opList ), updatedMemo ) =
                                diffMemo memo xs ys
                            result =
                                ( n, DCons Nothing DId opList )
                        in
                        ( result, Dict.insert ( (v1, v2) ) result updatedMemo )

                    else
                        let
                            ( ( n1, ops1 ), updatedMemo1 ) =
                                diffMemo memo xs v2
                            ( ( n2, ops2 ), updatedMemo2 ) =
                                diffMemo updatedMemo1 v1 ys
                            result =
                                if n1 < n2 then
                                    ( 1 + n1, DCons Nothing DRem ops1 )
                                else
                                    ( 1 + n2, DCons ( Just ( EChar [] y ) ) DId ops2 )
                        in
                        ( result, Dict.insert ( (v1, v2) ) result updatedMemo2 )


repWS : WSS -> Exp -> Exp
repWS ws e =
    case e of
        ECons _ lType e1 e2 -> ECons ws lType e1 e2
        ENil  _ lType       -> ENil ws lType
        _                   -> e


repPatWS : WSS -> Pattern -> Pattern
repPatWS ws p =
    case p of
        PCons _ lType p1 p2 -> PCons ws lType p1 p2
        PNil  _ lType       -> PNil ws lType
        _                   -> p