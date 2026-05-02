module LangUtils.Delta exposing (..)

import Syntax exposing (..)
import Printer.Delta


take : Int -> Delta -> Result String (Delta, Int)
take n dv =
    case (dv, n) of
        (_, 0) ->
            Result.Ok (DZero, 0)

        -- we've reached the end of the composition,
        (DCom dv1 DZero, _) ->
            Result.Ok (dv1, n - 1)

        (DCom dv2 dv1, _) ->
            take n dv1
            |> Result.andThen (\(dv1_, n_) ->
                if n_ == 0
                --  we've finished taking everything, so terminate with n = 0
                then Result.Ok <| (dv1_, 0)
                else Result.Ok <| (DCom dv2 dv1_, n_ - 1)
            )

        _ -> Err <| "Tried to take n > 1 from non-compositional delta: " ++ Printer.Delta.print dv

drop : Int -> Delta -> Result String (Delta, Int)
drop n dv =
    case (n, dv) of
        (0, _) ->
            Result.Ok (dv, 0)

        (_, DCom _ DZero) ->
            Ok (DZero, n - 1)

        (_, DCom dv1 dv2)   ->
            drop n dv2
            |> Result.andThen (\(_, n_) ->
                if n_ == 0
                then Result.Ok <| (dv1, 0)
                else Result.Ok <| (DZero, n - 1)
            )

        _ -> Err <| "Tried to drop n > 0 from non-compositional delta: " ++ Printer.Delta.print dv

length : Delta -> Int
length dv =
    case dv of
        DCom _ dv2 ->
            length dv2 + 1
        DZero -> 0
        _ -> 1


-- isLam : Delta -> Bool
-- isLam dv =
--     case dv of
--         DLam _ _ -> True

--         DCom dv1 dv2 -> isLam dv1 || isLam dv2

--         _ -> False


isNorm : Delta -> Bool
isNorm dv =
    case dv of
        DRem   -> True
        DId    -> True
        DAdd _ -> True

        DCom dv1 DZero -> isNorm dv1
        DCom dv1 dv2   -> isNorm dv1 && isNorm dv2

        DCons _ dv1 dv2     -> isNorm dv1 && isNorm dv2
        DTuple dv1 dv2      -> isNorm dv1 && isNorm dv2
        DHtml _ dv1 dv2 dv3 -> isNorm dv1 && isNorm dv2 && isNorm dv3
        
        _ -> False