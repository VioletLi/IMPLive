module Preclude exposing (..)

sum : String
sum = """let
        sum = \\n ->
                case n of 0 -> 0
                | _ -> n + sum (n - 1)
    in
        sum 2
"""


fib : String
fib = """let
        zipWith =
            \\l1 -> \\l2 -> \\g ->
                case l1 of
                    x1::xs1 ->
                        case l2 of
                            x2::xs2 ->
                                (g x1 x2)::(zipWith xs1 xs2 g)
                    | [] -> [],
        tail =
            \\l ->
                case l of
                    x :: xs -> xs
                    | [] -> [],
        indexOf =
            \\l -> \\n ->
                case n of
                    0 ->
                        (case l of
                            x :: xs -> x)
                    | _ ->
                        case l of
                            x :: xs ->
                                indexOf xs (n - 1),
        fibs =
            1::1::zipWith fibs (tail fibs) (\\a->\\b-> a + b),
        fib =
            \\n -> indexOf fibs n
    in
        fib 6
"""

gui : String
gui = """let
    fst = \\t ->
        case t of
            (x1, x2) -> x1,
    snd = \\t ->
        case t of
            (x1, x2) -> x2,
    gui = \\n->\\click->
        let
            n_ = 
                case click of
                    1 -> 1 + n |
                    2 -> 2 + n
        in
        (n_, gui n_)
    in
        fst ((snd (gui 0 1)) 2)
"""