module LangUtils.Preprocess exposing (..)

import Syntax exposing (..)

-- type Delta
--     = DZero
--     | DRem
--     | DId
--     | DAdd Int
--     | DTuple Delta Delta
--     | DCons (Maybe Exp) Delta Delta
--     | DLam Exp Delta
--     | DCom Delta Delta



{-
1. For all insert/lambda deltas, introduce a new variable in the heap that points to the value argument of that delta
2. Desugar all insert/delete deltas into DCons deltas for lists
3. Mark the second component of all DCom deltas with DComSnd
-}
preproc : Delta -> ID -> (Delta, Heap, ID)
preproc dv id =
    let
        (dv1, heap, id1) = introHeap dv id
    in
        (dv1 |> desugar, heap, id1)


introHeap : Delta -> ID -> (Delta, Heap, ID)
introHeap dv id =
    case dv of
        DInsert n v ->
            let
                x = "D" ++ Debug.toString id
            in
                (DInsert n (EVar [" "] x  0), [(x, ((v, v), DId, (Nothing, False)))], id+1)

        DLam v dv1 ->
            let
                (dv1_, heap, id1) = introHeap dv1 id
                x = "D" ++ Debug.toString id1
            in
                (DLam (EVar [" "] x 0) dv1_, (x, ((v, v), DId, (Nothing, False)))::heap, id1+1)

        DCons x dv1 dv2 ->
            let
                (dv1_, heap1, id1) = introHeap dv1 id
                (dv2_, heap2, id2) = introHeap dv2 id1
            in
                (DCons x dv1_ dv2_, heap1 ++ heap2, id2)

        DTuple dv1 dv2 ->
            let
                (dv1_, heap1, id1) = introHeap dv1 id
                (dv2_, heap2, id2) = introHeap dv2 id1
            in
                (DTuple dv1_ dv2_, heap1 ++ heap2, id2)

        DCom dv1 dv2 ->
            let
                (dv1_, heap1, id1) = introHeap dv1 id
                (dv2_, heap2, id2) = introHeap dv2 id1
            in
                (DCom dv1_ dv2_, heap1 ++ heap2, id2)

        DHtml n dv1 dv2 dv3 ->
            let
                (dv1_, heap1, id1) = introHeap dv1 id
                (dv2_, heap2, id2) = introHeap dv2 id1
                (dv3_, heap3, id3) = introHeap dv3 id2
            in
                (DHtml n dv1_ dv2_ dv3_, heap1 ++ heap2 ++ heap3, id3)

        _ ->
            (dv, [], id)


desugar : Delta -> Delta
desugar dv =
    case dv of
        DInsert n x ->
            if n == 0 then
                DCons (Just x) DId DId
            else
                DCons Nothing DId (desugar <| DInsert (n - 1) x)

        DDelete n ->
            if n == 0 then
                DCons Nothing DRem DId
            else
                DCons Nothing DId (desugar <| DDelete (n - 1))

        DCons me dv1 dv2     -> DCons me (desugar dv1) (desugar dv2)
        DTuple   dv1 dv2     -> DTuple   (desugar dv1) (desugar dv2)
        DCom     dv1 dv2     -> DCom     (desugar dv1) (desugar dv2)
        DLam  e  dv1         -> DLam  e  (desugar dv1)
        DHtml n  dv1 dv2 dv3 -> DHtml n  (desugar dv1) (desugar dv2) (desugar dv3)

        _ ->
            dv