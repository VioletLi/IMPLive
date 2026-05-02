module Eval exposing (..)

import Utils exposing (..)
import Syntax exposing (..)
import Printer.Exp as Exp
import Parser.Utils exposing (repWS)
import LangUtils.WHNF exposing (..)
import LangUtils.Fuse exposing (..)
import LangUtils.Delta exposing (..)
import LangUtils.Equality exposing (..)
import LangUtils.Substitute exposing (..)
import LangUtils.Rename exposing (renameExp, freshName)
import Parser.Heap exposing (heap)
import Html exposing (Html)


bwd : Delta -> Heap -> Exp -> ID -> (Heap, Exp, ID)
bwd dv heap exp id =
    case (exp, dv) of
        (_, DZero)          -> (heap, exp, id)
        (ENil _ _,     DId) -> (heap, exp, id)
        (EInt _ _,     DId) -> (heap, exp, id)
        (EBool _ _,    DId) -> (heap, exp, id)
        (EChar _ _,    DId) -> (heap, exp, id)
        (EParens wss e,    _)      ->
            let (heap1, exp1, id1) = bwd dv heap e id
            in  (heap1, EParens wss exp1, id1)
        (EInt wss n1, DAdd n2) -> (heap, EInt wss (n1 + n2), id)

        (ELam wssLam x ef, DLam (EVar _ x1 _) dv1) ->
            let
                (ef1, id1, renameSet) =
                    renameExp (substExp ef x x1) id
                (heap_, ef_, id2) =
                    bwd dv1 heap ef1 id1
                swapedRenamedVars =
                    List.map (\(a, b) -> (b, a)) renameSet
            in
                (heap_, ELam wssLam x <| substSet (substExp ef_ x1 x) swapedRenamedVars, id2)

        (EApp e1 e2, _) ->
            let
                (x, id1)     = freshName "R" id
                heapWithArg  = (x, ((e2, e2), DZero, (Nothing, False)))::heap
                (heap1, e1_, id2) =
                    bwd (DLam (EVar eVarDefaultWSS x 0) dv) heapWithArg e1 (id1)
            in
            case lookup x heap1 of
                Just ((_, e2_), _, _) ->
            {- The "temporary" fresh variable "R0" is used to construct a lambda-delta that updates the function f.
            In case we are globally updating f,  "R0" cannot be thrown away (i.e. return @delete "R0" heap1@) even
            though it is no longer needed after the update. This is because there may be other occurrences of "f"
            in the program which rely on the global update that contains "R0", and depend on having "R0" as a free
            variable in the heap.-}
                    (heap1, EApp e1_ e2_, id2)
                Nothing          ->
                    (heap, EError "ERROR #01: No Such Variable", id)

        (ELet wss decls e, _) ->
            let -- The updated bindings are stored in the heap.
                (heap1, e_, id1) = bwd dv (decls ++ heap) e id
                (decls_, heap_) = splitHeap decls heap1
            in  -- When printing out decls_, which has type @Heap@, only the updated expressions of the bindings are printed.
                (heap_, ELet wss decls_ e_, id1)

        (EVar wss x n, _) ->
            (\(h_, e_, id_) -> case e_ of
                -- If looking up a variable returns a non-variable expression, parenthesise it to be safe
                EVar _ _ _ ->  (h_, e_, id_)
                _          ->  (h_, EParens eParensDefaultWSS e_, id_))
            <| case lookup x heap of
                    Just ((e, nE), dv1, (v, b)) ->
                        if     n == length dv1 -- ^ the locally updated expression for x is consistent with the globally updated one
                            && b == False      -- ^ the global update for x has not yet been fully computed
                        -- This is the first occurrence of x encountered during bwd and we are currently changing its global update
                        then
                            let
                                (heap1, nE_, id1) = bwd dv heap nE id
                            in  -- True denotes that we have finished computing its global update in the current scope.
                                -- This may be (externally) "reset" to False if in the middle of applying a delta composition as a global update.
                                case lookup x heap1 of
                                    Just ((_, nE1_), _, (_, True)) ->
                                        if eqExp nE_ nE1_
                                            then (heap1, EVar wss x (length dv1), id1)
                                            else (heap1, nE_, id1)
                                    Just (_, _, (_, False)) ->
                                        ( replace x ((e, nE_), DCom dv dv1, (v, True)) heap1
                                        , EVar wss x (length <| DCom dv dv1), id1)

                                    _ -> (heap, EError "ERROR #09: No Such Variable", id)
                        else if not (isNorm dv1) && dv1 /= DZero
                            then
                                case take n dv1 of
                                    Ok (dv_, _) ->
                                        let
                                            (heap1, e1, id1) = bwd dv_ heap e id
                                            (heap2, e2, id2) = bwd dv  heap1 e1 id1
                                        in
                                            if eqExp e2 nE
                                            then (heap2, EVar wss x (length dv1), id2)
                                            else (heap2, e2, id2)
                                    res -> (heap, EError <| Debug.toString res, id)
                            else case drop n dv1 of
                                Ok (dv_, _) ->
                                    case diffDeltas dv dv_ |> Result.map simplify of
                                        Ok DZero     -> (heap, EVar wss x (length dv1), id)
                                        Ok DId       -> (heap, EVar wss x (length dv1), id)
                                        Ok (DAdd n1) ->
                                            (heap, EBPrim eBPrimDefaultWSS Add (EVar wss x (length dv1)) (EInt eIntDefaultWSS n1), id)
                                        Ok dv_diff   ->
                                            let (fun, _) = deltaToFun dv_diff id in
                                            (heap, EApp fun (EVar wss x (length dv1)), id)
                                        res          -> (heap, EError <| Debug.toString res, id)

                                res -> (heap, EError <| Debug.toString res, id)

                    Nothing ->
                        (heap, EError "ERROR #04: No Such Variable", id)
        
        (ECase wss guard branch, _) ->
            let
                matchfwd =
                    fwd heap guard id
                    |> Result.andThen (\(heap1_, zarg, id1) -> matchCase zarg branch id1 heap1_)
            in
            case matchfwd of
                Err e -> (heap, EError e, id)

                Ok (matchRes, id3)  ->
                    let
                        (heap2, ei_, id4) =
                            bwd dv matchRes.heap
                            (substSet matchRes.ei matchRes.renamedvars) id3

                        swapedRenamedVars =
                            List.map (\(x, y) -> (y, x)) matchRes.renamedvars

                        (branch_, _) =
                            updateBranch branch matchRes.choice
                            (substSet ei_ swapedRenamedVars) 0

                        -- (envm, heap3) =
                        --     splitHeap matchRes.envm heap2

                        dv_guard =
                            collectDvForGuard heap2
                            <| replPat matchRes.pi matchRes.renamedvars

                        (heap4, guard_, id5) =
                            bwd dv_guard heap2 guard id4
                    in
                        (heap4, ECase wss guard_ branch_, id5)

        (EBPrim wss Mul e1 e2, _) ->
            case simplify dv of
                DId    -> 
                    let
                        (heap1, e1_, id1) = bwd DId heap e1 id
                        (heap2, e2_, id2) = bwd DId heap1 e2 id1
                    in
                    (heap2, EBPrim wss Mul e1_ e2_, id2)

                DAdd n ->
                    case fwd heap e2 id of
                    Ok (_, z2, _) ->
                        case z2 of
                            EInt _ n2 ->
                                let
                                    (heap1, e1_, id1) = bwd (DAdd (n//n2)) heap e1 id
                                    (heap2, e2_, id2) = bwd DId heap1 e2 id1
                                in
                                (heap2, EBPrim wss Mul e1_ e2_, id2)
                            _       -> (heap, EError "ERROR #03: Wrong Operands.", id)

                    Err e -> (heap, EError e, id)
                _ -> 
                    let
                        _ = Debug.log "Bwd Mul Err: " <| simplify dv
                    in                    
                        (heap, EError "ERROR #03: Currently, Mul does not support composition.", id)

        (EBPrim wss Cat e1 e2, DCons _ _ _) ->
            let
                ((dv1, dv2), _, _) = splitDelta e1 dv heap id
                (heap1, e1_, id1) = bwd dv1 heap e1 id
                (heap2, e2_, id2) = bwd dv2 heap1 e2 id1
            in
            (heap2, EBPrim wss Cat e1_ e2_, id2)

        (EBPrim wss op e1 e2, _) ->
            let
                (heap1, e1_, id1) = bwd dv  heap  e1 id
                (heap2, e2_, id2) = bwd DId heap1 e2 id1
            in
                (heap2, EBPrim wss op e1_ e2_, id2)

        (ECons wss lType e1 e2, DId) ->
            let
                (heap1, e1_, id1) = bwd DId heap  e1  id
                (heap2, e2_, id2) = bwd DId heap1 e2 id1
            in
            (heap2, ECons wss lType e1_ e2_, id2)

        (_, DCons (Just _) DRem dv2) ->
            let
                (heap1, e2_, id2) = bwd dv2 heap exp id
            in
            (heap1, e2_, id2)

        (_, DCons (Just e1) dv1 dv2) ->
            let
                (heap1, e1_, id1) = bwd dv1 heap  e1  id
                (heap2, e2_, id2) = bwd dv2 heap1 exp id1
                (wssInserted, lTypeInserted, e2__) =
                    case exp of
                        -- exp is `x::xs`
                        ECons wss ConsType _ _ -> (wss, ConsType, e2_)

                        -- exp is a complete `[x, ...]`
                        ECons [ws1, ws2] SquareType _ _ -> ([ws1, ws2], SquareType, repWS eConsDefaultWSS e2_)

                        -- exp is a partial `[x, ...]` of `[..., x, ...]`
                        ECons [ws] SquareType _ _ -> ([ws], SquareType, e2_)

                        -- exp is a complete `[]`
                        ENil [ws1, ws2] SquareType ->
                            let
                                e2__WS =
                                    case e2_ of
                                        ECons _ SquareType _ _ -> eConsDefaultWSS
                                        ENil _ SquareType -> []
                                        _ -> ["ERROR #17: DCons update error, exp=" ++ (Debug.toString exp)]
                            in
                                ([ws1, ws2], SquareType, repWS e2__WS e2_)

                        -- exp is a partial `[]` of `[...]`
                        ENil [] SquareType -> (eConsDefaultWSS, SquareType, e2_)

                        ECons wss StringType _ _ -> (wss, StringType, e2_)
                        ENil  wss StringType     -> (wss, StringType, e2_)

                        _ -> (eConsDefaultWSS, SquareType, e2_)
            in
                (heap2, ECons wssInserted lTypeInserted e1_ e2__, id2)

        (ECons wss lType _ e2, DCons Nothing DRem dv2) ->
            let 
                (heap1, e2_, id1) = bwd dv2 heap e2 id
            in
            case (wss, lType, e2_) of
                ([ws1, ws2], SquareType, ECons _ _ e3 e4) -> (heap1, ECons wss lType e3 e4, id1)
                ([ws],       StringType, ECons _ _ e3 e4) -> (heap1, ECons wss lType e3 e4, id1)
                ([ws1, ws2], SquareType, ENil _ _)        -> (heap1, ENil  wss lType,       id1)
                ([ws],       StringType, ENil _ _)        -> (heap1, ENil  wss lType,       id1)
                
                _ -> (heap1, e2_, id1)
            

        (ECons wss lType e1 e2, DCons Nothing dv1 dv2) ->
            let
                (heap1, e1_, id1) = bwd dv1 heap e1 id
                (heap2, e2_, id2) = bwd dv2 heap1 e2 id1
            in
            (heap2, ECons wss lType e1_ e2_, id2)

        (ETuple wss tType e1 e2, DId) ->
            let
                (heap1, e1_, id1) = bwd DId heap  e1  id
                (heap2, e2_, id2) = bwd DId heap1 e2 id1
            in
            (heap2, ETuple wss tType e1_ e2_, id2)

        (EHtml wss s1 e1 e2 e3, DHtml s2 dv1 dv2 dv3) ->
            if s1 == s2 then
                let
                    (heap1, e1_, id1) = bwd dv1 heap  e1 id
                    (heap2, e2_, id2) = bwd dv2 heap1 e2 id1
                    (heap3, e3_, id3) = bwd dv3 heap2 e3 id2
                in
                (heap3, EHtml wss s1 e1_ e2_ e3_, id3)
            else (heap, EError "ERROR #02: HTML Type", id)

        (EHtml wss s e1 e2 e3, DId) ->
            let
                (heap1, e1_, id1) = bwd DId heap  e1 id
                (heap2, e2_, id2) = bwd DId heap1 e2 id1
                (heap3, e3_, id3) = bwd DId heap2 e3 id2
            in
            (heap3, EHtml wss s e1_ e2_ e3_, id3)

        (ETuple wss tType e1 e2, DTuple dv1 dv2) ->
            let
                (heap1, e1_, id1) = bwd dv1 heap  e1 id
                (heap2, e2_, id2) = bwd dv2 heap1 e2 id1
            in
                (heap2, ETuple wss tType e1_ e2_, id2)

        (_, DCom dv2 dv1) ->
            let
                (heap1, exp1, id1) = bwd dv1 heap  exp  id
                -- Refreshing the heap after applying dv2 allows any first occurrences of variables
                -- in @exp@ to continue having their global updates changed by dv1.
                (heap2, exp2, id2) = bwd dv2 (refreshHeap heap heap1) exp1 id1
            in
                (heap2, exp2, id2)

        (EUPrim wss Neg e, _) ->
            let
                (heap1, e_, id1) = 
                    case dv of
                        DAdd n -> bwd (DAdd (-n)) heap e id
                        DId    -> bwd DId heap e id
                        _     -> (heap, EError "ERROR #10: Invalid delta for Negation", id)
            in
            (heap1, EUPrim wss Neg e_, id1)
    
        (EUPrim wss Not e, DId) ->
            let
                (heap1, e_, id1) = bwd DId heap e id
            in  
                (heap1, EUPrim wss Not e_, id1)

        (ELam _ _ _, DId) ->
            let _ = Debug.log "Error in Bwd" "ERROR #08: Lambda cannot be modified by identity delta." in
            (heap, exp, id)

        _ ->
            let _ = Debug.log "Error in Bwd" (exp, dv) in
            (heap, exp, id)


fwd : Heap -> Exp -> ID -> Result String (Heap, Value, ID)
fwd heap exp id =
    case exp of
        EError err -> Err err
        -- | [E-CONST/CONSTRUCTOR/LAM]
        EParens _ e   -> fwd heap e id
        EInt _  _     -> Ok (heap, exp, id)
        EBool _ _     -> Ok (heap, exp, id)
        EChar _ _     -> Ok (heap, exp, id)
        ECons _ _ _ _ -> Ok (heap, exp, id)
        ENil _ _      -> Ok (heap, exp, id)
        ETuple _ _ _ _ -> Ok (heap, exp, id)
        ELam _ _ _      -> Ok (heap, exp, id)
        EHtml _ _ _ _ _ -> Ok (heap, exp, id)

        -- | [E-APP]
        EApp efun earg ->
            fwd heap efun id
            |> Result.andThen (\(heap1, zfun, id1) ->
            case zfun of
                ELam _ y ebody ->
                    let
                        (ŷ, id2) = freshName "x" id1
                        ebody1   = substExp ebody y ŷ
                    in    fwd ((ŷ, ((earg, earg), DZero, (Nothing, False))) :: heap1) ebody1 id2
                _ -> Err ("fwd [E-APP]: ERROR #05: Either not a function or not a variable argument"
                        ++ Exp.print zfun ++ "," ++ Exp.print earg)
            )
        -- | [E-VAR]
        EVar _ x _ ->
            case lookup x heap of
            -- | use memoized (already computed) value for @exp@ and return a renamed version
            Just (_, _, (Just z, _)) ->
                let (ẑ, id1, _) =
                        renameExp z id
                in  Ok (heap, ẑ, id1)
            -- | evaluate the value for @exp@ for the first time, storing this and returning the renamed verson
            Just ((oE, nE), dz_glb, (Nothing, b)) ->
                fwd (delete x heap) nE id
                |> Result.andThen (\(h2, z, id2) ->
                        let (ẑ, id3, _) = renameExp z id2
                            h3    = (x, ((oE, nE), dz_glb, (Just z, b))) :: h2
                        in  Ok (h3, ẑ, id3))
            Nothing -> Err <| "ERROR #06: No Such Variable." ++ x
        -- | [E-LET]
        ELet _ decls ebody ->
            fwd (decls ++ heap) ebody id
        -- | [E-CASE]
        ECase _ earg branch ->
            fwd heap earg id
            |> Result.andThen (\(heap1, zarg, id1) ->
            matchCase zarg branch id1 heap1
            |> Result.andThen (\(matchRes, id2) ->
            fwd matchRes.heap (substSet matchRes.ei matchRes.renamedvars) id2))
        -- | [E-UOP] -- to check
        EUPrim _ op e1 ->
            fwd heap e1 id
            |> Result.andThen (\(heap1, e1_, id1) ->
            expToResult (case (op, e1_) of
                            (Not, EBool wss b) -> EBool wss (not b)
                            (Neg, EInt wss n)  -> EInt wss (-n)
                            _              -> EError "ERROR #07: Inappropriate uoperator and argument")
            |> Result.andThen (\e_ -> Ok (heap1, e_, id1))
            )
        -- | [E-BINOP] -- to check
        -- TODO: add forward and backward for string add
        -- TODO: add forward and backward for list concat
        EBPrim _ op e1 e2 ->
            -- evaluate both arguments
            fwd heap e1 id
            |> Result.andThen (\(heap1, e1_, id1) ->
            fwd heap1 e2 id1
            |> Result.andThen (\(heap2, e2_, id2) ->
            case (e1_, e2_) of
                (EInt _ n1, EInt wss n2) ->
                    case op of
                        Sub ->  Ok (heap2, EInt wss (n1 - n2), id2)
                        Add ->  Ok (heap2, EInt wss (n1 + n2), id2)
                        Mul ->  Ok (heap2, EInt wss (n1 * n2), id2)
                        -- Div ->  EInt (n1 / n2)
                        Mod ->  Ok (heap2, EInt wss (modBy n1 n2),  id2)
                        Eq  ->  Ok (heap2, EBool wss (n1 == n2),    id2)
                        Ne  ->  Ok (heap2, EBool wss (n1 /= n2),    id2) 
                        Lt  ->  Ok (heap2, EBool wss (n1 < n2), id2)
                        Gt  ->  Ok (heap2, EBool wss (n1 > n2), id2)
                        Le  ->  Ok (heap2, EBool wss (n1 <= n2), id2)
                        Ge  ->  Ok (heap2, EBool wss (n1 >= n2), id2)
                        _   -> Err "ERROR #07: Inappropriate boperator between Integers."
                (EBool _ b1, EBool wss b2) ->
                    case op of
                        Eq  -> Ok (heap2, EBool wss (b1 == b2), id2)
                        Ne  -> Ok (heap2, EBool wss (b1 /= b2), id2)
                        And -> Ok (heap2, EBool wss (b1 && b2), id2)
                        Or  -> Ok (heap2, EBool wss (b1 || b2), id2)
                        _   -> Err "ERROR #07: Inappropriate boperator between Booleans."
                (EChar _ c1, EChar wss c2) ->
                    case op of
                        Eq  -> Ok (heap2, EBool wss (c1 == c2), id2)
                        Ne  -> Ok (heap2, EBool wss (c1 /= c2), id2) 
                        _   -> Err "ERROR #07: Inappropriate boperator between Chars."
                _ -> 
                    case op of
                        Cat -> append e1_ e2_ heap2 id2
                        Eq  -> strEq e1_ e2_ heap2 id2
                        Ne  -> strNe e1_ e2_ heap2 id2
                        _   -> Err <| "ERROR #07: Operands are not matching types." ++ Debug.toString (e1_, e2_)))

-------- LangUtils.Match
type alias MatchCaseRes =
    { choice : Int
    , ei : Value                     -- ^ original expression without renaming
    , pi : Pattern                   -- ^ original pattern
    , renamedvars : List (Var, Var)  -- ^ original pattern variable, fresh pattern variable
    , heap : Heap                    -- ^ heap containing fresh pattern variables (bound to the matched args)
    }

matchCase : Value -> Branch ->  ID -> Heap -> Result String (MatchCaseRes, ID)
matchCase e b id0 h =
    let
        go b_ cnt id =
            case b_ of
                BSin _ p t ->
                    match e p id h
                    |> Result.andThen (\(h_, renamedvars, id1) ->
                        Ok ({     choice = cnt
                                , ei = t
                                , pi = p
                                , renamedvars = renamedvars
                                , heap  = h_
                            }
                            , id1))

                BCom _ b1 b2 ->
                    case go b1 cnt id of
                        Ok (res, id1) -> Ok (res, id1)
                        Err _         -> go b2 (cnt + 1) id
    in  go b 1 id0


match : Value -> Pattern -> ID -> Heap -> Result String (Heap, List (Var, Var), ID)
match exp pat id h =
    case (exp, pat) of
        (EInt _ n1 , PInt _ n2) -> -- ^ any pattern-matched integers are never updated (in order to take the same branch path)
            if n1 == n2
            then Ok (h, [], id)
            else Err <| "Match Failed." ++ Debug.toString (exp, pat)
        (EBool _ b1, PBool _ b2) ->
            if b1 == b2
            then Ok (h, [], id)
            else Err <| "Match Failed." ++ Debug.toString (exp, pat)
        (EChar _ c1, PChar _ c2) ->
            if c1 == c2
            then Ok (h, [], id)
            else Err <| "Match Failed." ++ Debug.toString (exp, pat)
        (_, PVar _ x) ->
            let (y, id1) = freshName "x" id in
            Ok ((y, ((exp, exp), DZero, (Nothing, False)))::h, [(x, y)], id1)
        (ECons _ _ e1 e2, PCons _ _ p1 p2) ->
            match e1 p1 id h
            |> Result.andThen (\(h1, renamedvars1, id1) ->
            match e2 p2 id1 h1
            |> Result.andThen (\(h2, renamedvars2, id2) ->
            Ok (h2, renamedvars1 ++ renamedvars2, id2)))
        (ETuple _ _ e1 e2, PTuple _ _ p1 p2) ->
            match e1 p1 id h
            |> Result.andThen (\(h1, renamedvars1, id1) ->
            match e2 p2 id1 h1
            |> Result.andThen (\(h2, renamedvars2, id2) ->
            Ok (h2, renamedvars1 ++ renamedvars2, id2)))
        (EHtml _ s e1 e2 e3, PHtml _ s_ p1 p2 p3) ->
            if s == s_ then
                match e1 p1 id h
                |> Result.andThen (\(h1, renamedvars1, id1) ->
                match e2 p2 id1 h1
                |> Result.andThen (\(h2, renamedvars2, id2) ->
                match e3 p3 id2 h2
                |> Result.andThen (\(h3, renamedvars3, id3) ->
                Ok (h3, renamedvars1 ++ renamedvars2 ++ renamedvars3, id3)))
                )
            else Err <| "Match Failed." ++ Debug.toString (exp, pat)
        (ENil _ _, PNil _ _) -> Ok (h, [], id)
        (_,        POk _)    -> Ok (h, [], id)
        _ ->
            if isWHNF exp
            then Err <| "Match Failed." ++ Debug.toString (exp, pat)
            else
                case fwd h exp id of
                    Ok (h1, z, id1) ->
                        match z pat id1 h1
                    Err e -> Err e


splitHeap : Heap -> Heap -> (Heap, Heap)
splitHeap h1 h2 =
    case h1 of
        [] -> (h1, h2)

        (x, _)::h1_ ->
            let
                (h3, h4) = splitHeap h1_ h2
            in
                case lookup x h4 of
                    Just binding -> ((x,binding)::h3, delete x h4)
                    Nothing      -> ([], [])


diffDeltas : Delta -> Delta -> Result String Delta
diffDeltas dz1 dz2 = case (dz1, dz2) of
    (_, DId)    -> Ok dz1
    (DZero, _)  -> Ok DZero

    -- (DZero, _)  -> diffDeltas DId dz2
    (_, DZero)  -> Ok dz1

    (DRem, _)   -> Ok DRem
    (_, DRem)   -> Ok dz1

    (DId, DAdd _)       -> diffDeltas (DAdd 0) dz2
    (DId, DCons _ _ _)  -> diffDeltas (DCons Nothing DId DId) dz2
    (DId, DTuple _ _)   -> diffDeltas (DTuple DId DId) dz2
    (DId, DHtml s _ _ _) -> diffDeltas (DHtml s DId DId DId) dz2

    (DCom dz1a dz1b, DCom dz2a dz2b) ->
        diffDeltas dz1a dz2a
        |> Result.andThen (\dza ->
                diffDeltas dz1b dz2b
                |> Result.andThen (\dzb -> Ok <| DCom dza dzb))

    (_, DCom dz2a DZero) ->
        diffDeltas dz1 dz2a

    (DCom dz2a DZero, _) ->
        diffDeltas dz2a dz2

    (_, DCom dz2a dz2b) ->
        diffDeltas dz1 dz2b
        |> Result.andThen (\dzb ->
            diffDeltas DId dz2a
            |> Result.andThen (\dza -> Ok <| DCom dza dzb))

    (DCom dz1a dz1b, _) ->
        diffDeltas dz1b dz2
        |> Result.andThen (\dzb -> Ok <| DCom dz1a dzb)

    (DAdd dzn1, DAdd dzn2) ->
        if dzn1 - dzn2 == 0
        then Ok DZero
        else Ok <| DAdd (dzn1 - dzn2)

    (DTuple dz1a dz1b, DTuple dz2a dz2b) ->
        diffDeltas dz1a dz2a
        |> Result.andThen (\dza ->
                diffDeltas dz1b dz2b
                |> Result.andThen (\dzb -> Ok <| DTuple dza dzb))

    (DHtml s1 dz1a dz1b dz1c, DHtml s2 dz2a dz2b dz2c) -> 
        if s1 == s2 then
            diffDeltas dz1a dz2a
            |> Result.andThen (\dza ->
                diffDeltas dz1b dz2b
                    |> Result.andThen (\dzb ->
                        diffDeltas dz1c dz2c
                        |> Result.andThen (\dzc -> Ok <| DHtml s1 dza dzb dzc)))
        else Err "HTML delta diff error."

    
    (DCons Nothing dzx1 dzxs1, DCons Nothing dzx2 dzxs2) ->
        diffDeltas dzx1 dzx2
        |> Result.andThen (\dzx ->
                diffDeltas dzxs1 dzxs2
                |> Result.andThen (\dzxs -> Ok <| DCons Nothing dzx dzxs))
    (DCons Nothing _ _, DCons (Just _) _ dzxs2) ->
        diffDeltas dz1 dzxs2
        |> Result.andThen (\dzxs -> Ok <| DCons Nothing DRem dzxs)
    (DCons (Just x) dzx1 dzxs1, DCons Nothing _ _) ->
        diffDeltas dzxs1 dz2
        |> Result.andThen (\dzxs -> Ok <| DCons (Just x) dzx1 dzxs)
    (DCons (Just x) dzx1 dzxs1, DCons (Just y) dzx2 dzxs2) ->
        if x == y
        then
            diffDeltas dzx1 dzx2
            |> Result.andThen (\dzx ->
                diffDeltas dzxs1 dzxs2
                |> Result.andThen (\dzxs -> Ok <| DCons (Just x) dzx dzxs))
        else
            diffDeltas dzxs1 dzxs2
            |> Result.andThen (\dzxs -> Ok <| DCons (Just x) dzx1 (DCons Nothing DRem dzxs))

    (DLam _ _, DLam _ _) ->
        Err "diffDeltas: Not defined for DLam"
    (_, _) ->
        Err <| "diffDeltas: Non-matching deltas " ++ Debug.toString (dz1, dz2)


updateBranch : Branch -> Int -> Exp -> Int -> (Branch, Int)
updateBranch branch choice exp cnt =
    case branch of
        BSin wss p e ->
            if cnt + 1 == choice
            then (BSin wss p exp, cnt + 1)
            else (BSin wss p e, cnt + 1)

        BCom wss b1 b2 ->
            let
                (b1_, cnt1) =
                    updateBranch b1 choice exp cnt
            in
            if cnt1 == choice then
                (BCom wss b1_ b2, cnt1)
            else
                let
                    (b2_, cnt2) =
                        updateBranch b2 choice exp cnt1
                in
                    (BCom wss b1_ b2_, cnt2)


collectDvForGuard : Heap -> Pattern -> Delta
collectDvForGuard h pi =
    case pi of
        PVar _ x ->
            case lookup x h of
                Just (_, dv, _) -> dv
                Nothing         -> DZero
        
        PCons _ _ p1 p2    ->
            DCons Nothing (collectDvForGuard h p1) (collectDvForGuard h p2)

        PTuple _ _ p1 p2     ->
            DTuple (collectDvForGuard h p1) (collectDvForGuard h p2)

        PHtml _ s p1 p2 p3 ->
            DHtml s (collectDvForGuard h p1) (collectDvForGuard h p2) (collectDvForGuard h p3)

        PInt _ _   -> DId
        PNil _ _   -> DId
        PBool _ _  -> DId
        PChar _ _  -> DId

        POk _    -> DZero


replPat : Pattern -> List (String, String) -> Pattern
replPat pi renamedvars =
    case pi of
        PVar _ _ ->
            replPVar pi renamedvars

        PCons wss lType p1 p2 ->
            PCons wss lType (replPat p1 renamedvars) (replPat p2 renamedvars)

        PTuple wss tTuple p1 p2 ->
            PTuple wss tTuple (replPat p1 renamedvars) (replPat p2 renamedvars)

        PHtml wss s p1 p2 p3 ->
            PHtml wss s (replPat p1 renamedvars) (replPat p2 renamedvars) (replPat p3 renamedvars)

        _ -> pi

replPVar : Pattern -> List (String, String) -> Pattern
replPVar pi renamedvars =
    case renamedvars of
        [] -> pi
        (x, y)::renamedvars_ ->
            case pi of
                PVar wss s ->
                    if s == x
                    then PVar wss y
                    else replPVar pi renamedvars_
                
                _ -> pi

-- | Used in the middle of applying @DComp dv2 dv1@ to reset the flag for any first occurrences of variables,
--   allowing their global updates to continue being computed
refreshHeap : Heap -> Heap -> Heap
refreshHeap oHeap nHeap =
    case nHeap of
        [] -> []

        (x, (e, dv, (v, nb)))::nHeap_ ->
            case lookup x oHeap of
                Just (_, _, (_, ob)) ->
                    if     ob == False -- ^ we were not finished with computing the full global update for @x@
                        && nb == True  -- ^ more of the full global update for @x@ was computed
                    -- Then reset the flag for @x@ to False, allowing any subsequent composed deltas to still apply to the
                    -- global update for @x@
                    then   (x, (e, dv, (v, False)))::refreshHeap oHeap nHeap_
                    -- Otherwise, the original flag and the new flag can only ever be the same.
                    else   (x, (e, dv, (v, ob)))   ::refreshHeap oHeap nHeap_
                Nothing ->
                    (x, (e, dv, (v, nb)))::refreshHeap oHeap nHeap_


expToResult : Exp -> Result String Exp
expToResult e = case e of
    EError s -> Err s
    _        -> Ok e

strEq : Exp -> Exp -> Heap -> ID -> Result String (Heap, Exp, ID)
strEq e1 e2 heap id =
    fwd heap e1 id |> Result.andThen (\(heap1, z1, id1) ->
        fwd heap1 e2 id1 |> Result.andThen (\(heap2, z2, id2) ->
            case (z1, z2) of
                (ECons _ lType1 e11 e12, ECons _ lType2 e21 e22) ->
                    if lType1 == lType2 && lType1 == StringType
                    then 
                        fwd heap2 e11 id2 |> Result.andThen (\(heap3, z11, id3) ->
                            fwd heap3 e21 id3 |> Result.andThen (\(heap4, z21, id4) ->
                                case (z11, z21) of
                                    (EChar _ c1, EChar _ c2) ->
                                        if c1 == c2
                                        then strEq e12 e22 heap4 id4 |> Result.andThen (\(heap5, z12, id5) -> Ok (heap5, z12, id5))
                                        else Ok (heap4, EBool eBoolDefaultWSS False, id4)
                                    _ -> Err "ERROR #28: Eq Operands are not matching String Type." 
                            ))
                    else Err "ERROR #28: Eq Operands are not matching List Type." 

                (ENil _ lType1, ENil _ lType2) -> 
                    if lType1 == lType2 && lType1 == StringType
                    then Ok (heap2, EBool eBoolDefaultWSS True, id2)
                    else Err "ERROR #28: Eq Operands are not matching List Type." 
                (ECons _ _ _ _, ENil _ _) -> Ok (heap2, EBool eBoolDefaultWSS False, id2)
                (ENil _ _, ECons _ _ _ _) -> Ok (heap2, EBool eBoolDefaultWSS False, id2)
                _ -> Err "ERROR #28: Eq Operands are not matching String Type."
        ))

strNe : Exp -> Exp -> Heap -> ID -> Result String (Heap, Exp, ID)
strNe e1 e2 heap id =
    strEq e1 e2 heap id |> Result.andThen (\(heap_, z, id_) ->
        case z of
            EBool wss b -> Ok (heap_, EBool wss (not b), id_)
            _ -> Err "ERROR #29: Ne Operands are not matching Boolean Type.")

append : Exp -> Exp -> Heap -> ID -> Result String (Heap, Exp, ID)
append e1 e2 heap id =
    case e1 of
        ECons wss lType e11 (ENil _ _) ->
            case e2 of
                ENil _ _      -> Ok (heap, e1, id)

                _ ->
                    fwd heap e2 id
                    |> Result.andThen (\(heap_, e2_, id_) ->
                    Ok (heap_, ECons wss lType e11 (repWS [" "] e2_), id_))

        ECons wss lType e11 e12        ->
            append e12 e2 heap id
            |> Result.andThen (\(heap_, e12_, id_) -> Ok (heap_, ECons wss lType e11 e12_, id_))

        ENil _ lType ->
            append e2 (ENil eNilDefaultWSS lType) heap id
        
        _        ->
            fwd heap e1 id
            |> Result.andThen (\(heap_, e1_, id_) -> append e1_ e2 heap_ id_)


splitDelta : Exp -> Delta -> Heap -> ID -> ((Delta, Delta), Heap, ID)
splitDelta e dv h id =
    case (e, simplify dv) of
        (ECons _ _ _ e2, DCons Nothing dv1 dv2) ->
            let ((dv1_, dv2_), h_, id_) = splitDelta e2 dv2 h id
            in  ((DCons Nothing dv1 dv1_, dv2_), h_, id_)
        
        (_, DCons (Just e_) dv1 dv2) ->
            let ((dv1_, dv2_), h_, id_) = splitDelta e dv2 h id
            in ((DCons (Just e_) dv1 dv1_, dv2_), h_, id_)

        (ENil _ _, _) -> ((DId, dv), h, id)

        _ ->
            if isWHNF e then
                ((DId, DId), h, id)
            else
                case fwd h e id of
                Ok (h1, z, id1) ->
                    splitDelta z dv h1 id1
                Err _ -> ((DId, DId), h, id)