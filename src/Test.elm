module Test exposing (..)

import Printer.Exp as Exp
import Printer.Heap as Heap
import Syntax exposing (..)
import Parser exposing (..)
import Eval exposing (bwd, fwd)
import Parser.Delta exposing (delta)
import Parser.Exp exposing (parse)
import LangUtils.Fuse exposing (..)
import LangUtils.Preprocess exposing (..)
import Utils exposing (lookup, uncurry3)
import LangUtils.Postprocess exposing (..)
import Preclude exposing (..)
import Parser.Heap exposing (heap)

examples : List (Int, (String, String, String))
examples =
    [ (1,("{}", "1+2", "+1"))
    , (2,("{}", "(\\x->x) 1", "+1"))
    , (3,("{}", "let x = 5 in case x of 5 -> 3", "+1"))
    , (4,("{}", "let x = 5 in let y = 4 in x + y", "+1"))
    , (5,("{}", "let x = 5 in let y = [4] in x::y", "+1::+2::id"))
    , (6,("{}", "let c = 0 in let f = \\x->x+c+1 in let b = 1 in let a = f b in f a", "+10"))
    , (7,("{}", "let b = 0 in (let f = \\x->x+b+1 in let a = 1 in [f a, f a])", "+10::+20::id"))
    , (8,("{}", "[1,3]", "insert 1 2"))
    , (9,("{}", "[1,3]", "delete 1"))
    , (10,("{}", "[1,3]", "(delete 2);(insert 1 2)"))
    , (11,("{}", "[1,3]", "(insert 1 2);(delete 1)"))
    , (12,("{}", "[1,3]", "(insert 1 2);(+1::+1::id)"))
    , (13,("{}", "[1,3]", "(+1::+1::id);(insert 1 2)"))
    , (14,("{}", "[1,3]", "(delete 1);(+1::+1::id)"))
    , (15,("{}", "[1,3]", "(+1::id);(delete 1)"))
    , (16,("{}", "\\x->1", "(\\1->+1);(\\2->id)"))
    , (17,("{}", "\\x->1", "(\\2->+2);(\\1->+1)"))
    , (18,("{}", "let a = 1 in \\x->[x, a, 0]", "(\\10->+10::+20::+30::id);(\\0->+1::+2::+3::id)"))
    , (19,("{}", "let f = \\x->1 in [f, f]", "(\\1->+1)::(\\2->+2)::id"))
    , (20,("{}", "(1,2)", "(+100,+200);(+10,+20)"))
    , (21,("{}", "let a = 1 in (a,a)", "(+10,+20);(+1,+2)"))
    , (23,("{}", "let a = 0 in let f = \\x->a in f", "(\\2->+1);(\\1->+1)"))
    , (24,("{}", "let a = 0 in let f = \\y->(a,a) in f", "(\\2->(+1,+2));(\\1->(+1,+2))"))
    , (25,("{}", "let a = 0 in let f = \\x->(a,a) in f 1", "(+1,+2);(+1,+2)"))
    , (26,("{}", "let a = 0 in let f = \\x->(a,a) in (f, f)", "(\\1->(+1,+2),\\2->(+1,+2))"))
    , (27,("{}", "let a = 0 in let f = \\x->(a,a) in (f, f)", "(\\3->(+3,+4),\\4->(+5,+6));(\\1->(+1,+2),\\2->(+1,+2))"))
    , (29,("{}", "let f = \\x->x in f 1", "+10"))
    , (30,("{}", "let ls = 1::ls in ls", "+1::+2::?"))
    , (31,("{}", "let b = 0 in let f = \\x->x+b+1 in let a = 1 in [[f a, f b], f a]", "(+10::+0::id)::+20::id"))
    , (32,("{}", "let b = 0 in let f = \\x->x in let a = 1 in [[f a, f b], f a]", "((+10::+0::id)::+20::id);((+10::+0::id)::+20::id)"))
    , (33,("{}", "let b = 0 in let f = (\\x->x) in let a = 1 in [f a, f b]", "(+10::+0::id);(+10::+0::id)"))
    , (34,("{}", "let f = \\x-> (x+1)::f x in f 1", "+1::+2::?"))
    , (35,("{}", "let f = \\x-> case x of 0->0 | _ -> x+f (x-1) in f 2", "+1"))
    , (36, ("{}", gui, "+1"))
    , (37, ("{}", "let f = \\x->\\y->let a = x in (a, f a) in f 1 2", "(?, \\1->(+1, ?))"))
    , (38,("{}", "let a = (1,2) in (a, a)", "((+1, +2), (+10, +20))"))
    , (39,("{}", "let a = [1,2] in [a, a]", "((+1::+2::id)::(+10::+20::id)::id)"))
    , (40,("{}", "let a = (-1)+3*3-2 in a", "(+1)"))
    , (41,("{}", "let a = 3*4 in a", "+4"))
    , (42,("{}", "Html.div [(\"color\", \"red\"), (\"position\", \"fixed\")] [(\"id\", \"div1\"), (\"class\", \"div-class\")] [\"test\"]", "Html.div id id (\"test\"=>\"success\")::id"))
    , (42,("{}", "\"abc\"", "\"abc\"=>\"adfe\""))
    , (43,("{}", "\"abc\"++\"123\"", "\"abc123\"=>\"abcM123\""))
    , (44,("{}", "[1,2]++[3,4]", "insert 2 10 ; delete 2"))
    , (45,("{}", "1::2::[]", "insert 1 3"))
    , (46,("{}", "case [1,2] of x::y::z->[x,y]", "+1::+2::id"))
    , (47,("{}", "case \"str\" of \"str\"->0", "id"))
    , (48,("{}", "let x = \"2\" in [x]", "(\"2\"=>\"3\")::id"))
    , (49,("{}", "case Gui 1 2 of Gui x y->x", "+1"))
    , (50,("{}", "case Event \"Click\" [2] of Event \"Click\" y->y | _ ->1", "+1::id"))
    , (51,("{}", "let fst = \\t -> case t of (x1, x2) -> (x1, x2), a = 1, b = (a,a) in b", "(+1, +2)"))
    , (52,("{}", "let b = 1, g = (b,b) in (g, g)", "((+1, ?), (+2, +3))"))
    , (53,("{}", "let ls = [1] in (ls, ls)", "(delete 0, insert 0 2)"))
    , (54,("{}", "let f = \\x->x in f", "(\\1->+2);(\\0->+1)"))
    , (55,("{}", "let a = \"ab\" in (a, a)", "(id, \"ab\"=>\"aB\")"))
    , (56,("{}", "Html.div [] [] [\"Thursday, April 26th 2018\"]", "Html.div id id (\"Thursday, April 26th 2018\"=>\"Thursday, pril 26th 2018\")::id"))
    ]

testId : Int -> ()
testId n =
  case lookup n examples of
    Just ex -> uncurry3 (test n) ex
    Nothing -> Debug.log ("Invalid test id: " ++ Debug.toString n) ()

testAll : List ()
testAll =
    List.map (\(test_idx, (inputHeap, inputExp, upd)) ->
      Debug.log "() :-----------" <| uncurry3 (test test_idx) (inputHeap, inputExp, upd)
    ) (List.reverse examples)

-- Ctx -> Exp -> Delta -> Exp
-- e.g.  test "{}" "(\\x->x) 1" "+2"
test : a -> String -> String -> String -> ()
test a inputHeap inputExp upd =
    let logStack1 = [Debug.toString a, "[Input]",  "Heap: " ++ inputHeap, "Exp: " ++ inputExp, "Delta: " ++ upd ]
    in
        case (run (heap |. end) inputHeap, parse inputExp, run (delta |. end) upd) of
        (Result.Ok oHeap, Result.Ok oExp, Result.Ok delta) ->
          -- | Forward evaluation of original expression/heap
          case fwd oHeap oExp 0 of
            Result.Ok (h_fwd, e_fwd, _) ->
              let
              -- | Backward updating of original expression/heap
                  (dv, heap1, _) =
                    preproc delta 0

                  (h_bwd, exp_bwd, _) =
                    bwd dv (heap1 ++ oHeap) oExp 0

                  h_post_ =
                    postprocessHeap h_bwd h_bwd

                  exp_post = -- exp_bwd
                    postprocess exp_bwd h_post_

                  h_post = []

                  logStack2 = logStack1 ++ ["[Fwd]",  "Heap: " ++  Heap.print h_fwd, "Exp: " ++ Exp.print e_fwd,
                                            "[Bwd]", "Heap: " ++ Heap.print h_post,  "Exp: " ++ Exp.print exp_post]
              in -- | Forward evaluation of the backward updated expression/heap
                  case (fwd h_post exp_post 0) of
                    Result.Ok (h_bwd_fwd, e_bwd_fwd, _) ->
                      logLines (logStack2 ++ ["[Bwd-Fwd]", "Heap: " ++ Heap.print h_bwd_fwd,  "Exp: " ++ Exp.print e_bwd_fwd]) ()
                    Result.Err err ->
                      logLines logStack2 <| Debug.log err ()
            Result.Err err ->
              logLines logStack1 Debug.log err ()
        (heap_res, exp_res, delta_res) ->
          let _ = Debug.log "heap_res" heap_res in
          let _ = Debug.log "exp_res" exp_res in
          let _ = Debug.log "delta_res" delta_res in
          logLines logStack1 <| Debug.log ("ERROR") ()

logLines : List String -> a -> a
logLines xs a =
  let go ys = case ys of
        (x :: ys_) -> Debug.log x <| go ys_
        []         -> a
  in  go (List.reverse xs)