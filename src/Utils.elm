module Utils exposing (..)

lookup : a -> List (a, b) -> Maybe b
lookup s ls =
    case ls of
        [] ->
            Nothing
        (s1, v1) :: ls_ ->
            if s1 == s then
                Just v1
            else
                lookup s ls_

delete : String -> List (String, a) -> (List (String, a))
delete x xvs = case xvs of
    [] -> []

    (x1, v1) :: xvs_ ->
        if x1 == x then
            (xvs_)
        else
            let
                ls1 =
                    delete x xvs_
            in
                ((x1, v1) :: ls1)

insert : String -> a -> List (String, a) -> List (String, a)
insert x v xvs =
    (x, v) :: delete x xvs

replace : String -> a -> List (String, a) -> List (String, a)
replace x v xvs =
    case xvs of
        [] ->
            []

        (x1, v1) :: xvs_ ->
            if x1 == x then
                (x, v) :: xvs_
            else
                (x1, v1) :: replace x v xvs_

uncurry : (a -> b -> c) -> (a, b) -> c
uncurry f (x, y) = f x y

uncurry3 : (a -> b -> c -> d) -> (a, b, c) -> d
uncurry3 f (x, y, z) = f x y z

-- deleteWithCounter : a -> List ( a, b ) -> Int -> ( List ( a, b ), Int )
-- deleteWithCounter s ls cnt =
--     case ls of
--         [] ->
--             ([], cnt)

--         (s1, v1) :: ls_ ->
--             if s1 == s then
--                 (ls_, cnt)
--             else
--                 let
--                     (ls1, cnt_) =
--                         deleteWithCounter s ls_ (cnt + 1)
--                 in
--                     ((s1, v1) :: ls1, cnt_)

-- insertAt : a -> Int -> List a -> List a
-- insertAt v i xvs =
--     case xvs of
--         [] ->
--             [ v ]

--         v1 :: xvs_ ->
--             if i == 0 then
--                 v :: xvs
--             else
--                 v1 :: insertAt v (i - 1) xvs_
