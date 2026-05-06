module FwdEval exposing (fwdComp, fwdExp, fwdProgram)

{-| Forward evaluator for @NewSyntax@: expressions → @Value@; computations → @Store@ × @Value@.

    Normal commands (@skip@, assignment, @if@ / @while@ completing without inner @return@) finish with @VUnit@.
    @return e@ finishes with @e@’s value (never @VUnit@ for a successful return).

    @CSeq@: run @c1@; if @VUnit@, run @c2@; otherwise short-circuit with @c1@’s value (@return@ skips the rest of the sequence).

    @CWhile@: evaluate @guard@; @False@ → @VUnit@; @True@ → @CSeq body (CWhile guard body)@. If guard is @VHole@, do not iterate: collect assign targets in @body@ (and callees, excluding each @fun@’s pattern locals), set those store slots to @VHole \"while-hole:\"++x σ@, leave others unchanged, @VUnit@.

    @CIf@ with guard @VHole@: run @then@ and @else@ from the same store; both must yield @VUnit@; merge stores over @sigmaBefore@’s variable domain (assumed equal to both branches’ domains; mismatch is undefined).

    @ECons e1 e2@ builds @VCons@; @EList@ delegates to its payload. Function bodies must end with a non-@VUnit@ value (@return@); @CAssignCall@ maps that to @VUnit@ after storing.
-}

import NewSyntax exposing (..)

import NewParser.Utils exposing (arrayGetAt, arrayLenValue, arrayUpdatePath)


{-| Run a full program (@NewSyntax@ ordered @Stmt@ list): accumulate @StmtFun@ into @FunEnv@,
    execute each @StmtComp@ in order. Top-level @return@ is an error.
-}
fwdProgram : List Stmt -> Result String Store
fwdProgram stmts =
    List.foldl fwdProgramStep (Ok ( [], emptyStore )) stmts
        |> Result.andThen (\( _, sigma ) -> Ok sigma)


fwdProgramStep : Stmt -> Result String ( FunEnv, Store ) -> Result String ( FunEnv, Store )
fwdProgramStep stmt acc =
    case acc of
        Err e ->
            Err e

        Ok ( gamma, sigma ) ->
            case stmt of
                StmtFun _ fname pat body ->
                    Ok ( ( fname, pat, body ) :: gamma, sigma )

                StmtComp c ->
                    fwdComp gamma sigma c
                        |> Result.andThen
                            (\( sigma1, out ) ->
                                if compYieldsUnit out then
                                    Ok ( gamma, sigma1 )

                                else
                                    Err "fwdProgram: return outside of function body"
                            )


emptyStore : Store
emptyStore =
    []


{-| Look up the rightmost (outermost) binding first — matches parser store convention @(::)@ head shadows tail. -}
lookupStore : Var -> Store -> Maybe Value
lookupStore x sigma =
    case sigma of
        [] ->
            Nothing

        ( y, v ) :: rest ->
            if x == y then
                Just v

            else
                lookupStore x rest


extendStore : List ( Var, Value ) -> Store -> Store
extendStore binds sigma =
    binds ++ sigma


storeSet : Var -> Value -> Store -> Store
storeSet x v sigma =
    ( x, v ) :: sigma


{-| Remove the first binding for each name in @pat@ (parameters after a call). -}
popParams : Pat -> Store -> Store
popParams pat sigma =
    List.foldl removeFirstBinding sigma (patVars pat)


patVars : Pat -> List Var
patVars pat_ =
    case pat_ of
        PVar _ x ->
            [ x ]

        PNil _ ->
            []

        PCons _ p1 p2 ->
            patVars p1 ++ patVars p2


removeFirstBinding : Var -> Store -> Store
removeFirstBinding x sigma =
    case sigma of
        [] ->
            []

        ( y, v ) :: rest ->
            if x == y then
                rest

            else
                ( y, v ) :: removeFirstBinding x rest


lookupFun : FunName -> FunEnv -> Maybe ( Pat, Comp )
lookupFun fname gamma =
    case gamma of
        [] ->
            Nothing

        ( g, pat, body ) :: rest ->
            if g == fname then
                Just ( pat, body )

            else
                lookupFun fname rest


{-| Dedupe variable names (preserves right-most-first foldr order of first occurrences). -}
uniqVars : List Var -> List Var
uniqVars xs =
    List.foldr
        (\y acc ->
            if List.member y acc then
                acc

            else
                y :: acc
        )
        []
        xs


{-| Left-hand sides allowed for @CAssign@: a bare variable or a chain of @EIndex@ ending in a variable.
    Anything else is rejected at evaluation time.
-}
peelIndexedVarPath : Exp -> Result String ( Var, List Exp )
peelIndexedVarPath e =
    case e of
        EVar _ x ->
            Ok ( x, [] )

        EIndex _ base idx ->
            peelIndexedVarPath base
                |> Result.map (\( x, idxs ) -> ( x, idxs ++ [ idx ] ))

        _ ->
            Err "fwdComp: illegal assignment target (expected a variable or indexed variable, e.g. x or x[i])"


{-| Write @newVal@ to @lhs@ (@EVar@ or @EIndex@ chain); same rules as @CAssign@. -}
assignValueToLhs : FunEnv -> Store -> Exp -> Value -> Result String Store
assignValueToLhs gamma sigma lhs newVal =
    peelIndexedVarPath lhs
        |> Result.andThen
            (\( var, idxs ) ->
                if idxs == [] then
                    Ok (storeSet var newVal sigma)

                else
                    evalIndexInts gamma sigma idxs
                        |> Result.andThen
                            (\is ->
                                case lookupStore var sigma of
                                    Nothing ->
                                        Err ("fwdComp: unbound array variable " ++ var)

                                    Just spine ->
                                        arrayUpdatePath is newVal spine
                                            |> Result.map (\sp2 -> storeSet var sp2 sigma)
                            )
            )


{-| Assign targets that may touch non-locals: @CAssign@ / call-result @lhs@, plus callee bodies with formals excluded.
    Unknown @fname@ in env → no callee effects (under-approximation).
-}
globalAssignTargetsFromComp : FunEnv -> List Var -> Comp -> List Var
globalAssignTargetsFromComp gamma locals c =
    case c of
        CSkip _ ->
            []

        CAssign _ lhs _ ->
            case peelIndexedVarPath lhs of
                Ok ( x, _ ) ->
                    if List.member x locals then
                        []

                    else
                        [ x ]

                Err _ ->
                    []

        CAssignCall _ lhs fname _ ->
            let
                lhsTargets =
                    case peelIndexedVarPath lhs of
                        Ok ( x, _ ) ->
                            if List.member x locals then
                                []

                            else
                                [ x ]

                        Err _ ->
                            []

                calleeTargets =
                    if fname == "len" then
                        []

                    else
                        case lookupFun fname gamma of
                            Nothing ->
                                []

                            Just ( pat, body ) ->
                                globalAssignTargetsFromComp gamma (patVars pat) body
            in
            uniqVars (lhsTargets ++ calleeTargets)

        CSeq _ c1 c2 ->
            uniqVars
                (globalAssignTargetsFromComp gamma locals c1
                    ++ globalAssignTargetsFromComp gamma locals c2
                )

        CIf _ _ th el ->
            uniqVars
                (globalAssignTargetsFromComp gamma locals th
                    ++ globalAssignTargetsFromComp gamma locals el
                )

        CWhile _ _ inner ->
            globalAssignTargetsFromComp gamma locals inner

        CReturn _ _ ->
            []


patMatch : Pat -> Value -> Result String (List ( Var, Value ))
patMatch pat_ val =
    case ( pat_, val ) of
        ( PVar _ x, v ) ->
            Ok [ ( x, v ) ]

        ( PNil _, VNil ) ->
            Ok []

        ( PNil _, _ ) ->
            Err "patMatch: empty pattern expects ()"

        ( PCons _ p1 p2, VCons v1 v2 ) ->
            patMatch p1 v1
                |> Result.andThen
                    (\b1 ->
                        patMatch p2 v2
                            |> Result.map (\b2 -> b1 ++ b2)
                    )

        ( PCons _ _ _, _ ) ->
            Err "patMatch: cons pattern expects cons value"


{-| Call actuals use the same @fwdExp@ rules as expressions (@ENil@, unary @exp@, nested @ECons@ → @VCons@). -}
evalCallArgs : FunEnv -> Store -> Exp -> Result String Value
evalCallArgs gamma sigma e =
    fwdExp gamma sigma e


{-| Evaluate index expressions left-to-right as non-negative ints (array indices). -}
evalIndexInts : FunEnv -> Store -> List Exp -> Result String (List Int)
evalIndexInts gamma sigma idxs =
    List.foldl
        (\ie acc ->
            acc
                |> Result.andThen
                    (\rest ->
                        fwdExp gamma sigma ie
                            |> Result.andThen
                                (\v ->
                                    case v of
                                        VInt i ->
                                            if i < 0 then
                                                Err "array index must be non-negative"

                                            else
                                                Ok (rest ++ [ i ])

                                        _ ->
                                            Err "array index must be integer"
                                )
                    )
        )
        (Ok [])
        idxs


fwdExp : FunEnv -> Store -> Exp -> Result String Value
fwdExp gamma sigma e =
    case e of
        EError info ->
            Err info

        EInt _ n ->
            Ok (VInt n)

        EBool _ b ->
            Ok (VBool b)

        EString _ s ->
            Ok (VString s)

        EVar _ x ->
            case lookupStore x sigma of
                Nothing ->
                    Err ("fwdExp: unbound variable " ++ x)

                Just v ->
                    Ok v

        EIndex _ base idxE ->
            fwdExp gamma sigma base
                |> Result.andThen
                    (\spine ->
                        fwdExp gamma sigma idxE
                            |> Result.andThen
                                (\iv ->
                                    case iv of
                                        VInt i ->
                                            arrayGetAt i spine

                                        _ ->
                                            Err "array index must be integer"
                                )
                    )

        ELen _ arg ->
            fwdExp gamma sigma arg
                |> Result.andThen arrayLenValue
                |> Result.map VInt

        EParens _ inner ->
            fwdExp gamma sigma inner

        ENil _ ->
            Ok VNil

        ECons _ e1 e2 ->
            fwdExp gamma sigma e1
                |> Result.andThen
                    (\v1 ->
                        fwdExp gamma sigma e2
                            |> Result.map (\v2 -> VCons v1 v2)
                    )

        EList _ payload ->
            fwdExp gamma sigma payload

        EBPrim _ op e1 e2 ->
            fwdExp gamma sigma e1
                |> Result.andThen
                    (\v1 ->
                        fwdExp gamma sigma e2
                            |> Result.andThen (\v2 -> evalBop op v1 v2)
                    )

        EHole _ hn ->
            Ok (VHole hn sigma)

        EHtml _ s e1 e2 e3 ->
            let v1 = fwdExp gamma sigma e1
                v2 = fwdExp gamma sigma e2
                v3 = fwdExp gamma sigma e3
            in
            case ( v1, v2, v3 ) of
                (Ok v1_, Ok v2_, Ok v3_) ->
                    Ok (VHtml s v1_ v2_ v3_)
                _ ->
                    Err "fwdExp: EHtml expects three values"

evalBop : Bop -> Value -> Value -> Result String Value
evalBop op v1 v2 =
    case op of
        Add ->
            intOp2 (\a b -> a + b) v1 v2

        Sub ->
            intOp2 (\a b -> a - b) v1 v2

        Append ->
            appendValues v1 v2

        Mul ->
            intOp2 (\a b -> a * b) v1 v2

        Div ->
            case ( v1, v2 ) of
                ( VInt a, VInt b ) ->
                    if b == 0 then
                        Err "evalBop: division by zero"

                    else
                        Ok (VInt (a // b))

                _ ->
                    Err "evalBop: Div expects two integers"

        Mod ->
            case ( v1, v2 ) of
                ( VInt a, VInt b ) ->
                    if b == 0 then
                        Err "evalBop: modulo by zero"

                    else
                        Ok (VInt (remainderBy b a))

                _ ->
                    Err "evalBop: Mod expects two integers"

        Eq ->
            Ok (VBool (valueEq v1 v2))

        Ne ->
            Ok (VBool (not (valueEq v1 v2)))

        Lt ->
            intCmp (\a b -> a < b) v1 v2

        Gt ->
            intCmp (\a b -> a > b) v1 v2

        Le ->
            intCmp (\a b -> a <= b) v1 v2

        Ge ->
            intCmp (\a b -> a >= b) v1 v2

        And ->
            case ( v1, v2 ) of
                ( VBool a, VBool b ) ->
                    Ok (VBool (a && b))

                _ ->
                    Err "evalBop: And expects two booleans"

        Or ->
            case ( v1, v2 ) of
                ( VBool a, VBool b ) ->
                    Ok (VBool (a || b))

                _ ->
                    Err "evalBop: Or expects two booleans"


{-| List concatenation on runtime lists (@VNil@ / @VCons@ spines only). -}
appendValues : Value -> Value -> Result String Value
appendValues xs ys =
    case xs of
        VNil ->
            Ok ys

        VCons h t ->
            appendValues t ys
                |> Result.map (\rest -> VCons h rest)

        _ ->
            Err "evalBop: Append expects a list on the left"



intOp2 : (Int -> Int -> Int) -> Value -> Value -> Result String Value
intOp2 f v1 v2 =
    case ( v1, v2 ) of
        ( VInt a, VInt b ) ->
            Ok (VInt (f a b))

        _ ->
            Err "intOp2: expected two integers"


intCmp : (Int -> Int -> Bool) -> Value -> Value -> Result String Value
intCmp rel v1 v2 =
    case ( v1, v2 ) of
        ( VInt a, VInt b ) ->
            Ok (VBool (rel a b))

        _ ->
            Err "intCmp: expected two integers"


valueEq : Value -> Value -> Bool
valueEq a b =
    case ( a, b ) of
        ( VInt i, VInt j ) ->
            i == j

        ( VBool p, VBool q ) ->
            p == q

        ( VString s, VString t ) ->
            s == t

        ( VUnit, VUnit ) ->
            True

        ( VNil, VNil ) ->
            True

        ( VCons x xs, VCons y ys ) ->
            valueEq x y && valueEq xs ys

        ( VHole hx sx, VHole hy sy ) ->
            hx == hy && sx == sy

        _ ->
            False


{-| Variable domain of @σ@ (each name once; order follows @foldr@ over the binding list). -}
uniqueVarNames : Store -> List Var
uniqueVarNames sigma =
    List.foldr
        (\( x, _ ) acc ->
            if List.member x acc then
                acc

            else
                x :: acc
        )
        []
        sigma


{-| Hole-guard @if@ merge: iterate @sigmaBefore@’s domain only — assumes @sigmaT@ / @sigmaF@ share that domain (no new vars in branches). Domain mismatch is illegal / undefined and yields @Err@.
-}
mergeStoresHoleGuard : Store -> Store -> Store -> Result String Store
mergeStoresHoleGuard sigmaBefore sigmaT sigmaF =
    let
        names =
            uniqueVarNames sigmaBefore
    in
    List.foldr
        (\x acc ->
            acc
                |> Result.andThen
                    (\mergedRev ->
                        case ( lookupStore x sigmaT, lookupStore x sigmaF ) of
                            ( Just vT, Just vF ) ->
                                Ok
                                    (( x
                                     , if valueEq vT vF then
                                           vT

                                       else
                                           VHole ("if-diff:" ++ x) sigmaBefore
                                     )
                                        :: mergedRev
                                    )

                            _ ->
                                Err "fwdComp: hole-if merge: domain mismatch (illegal program)"
                    )
        )
        (Ok [])
        names


{-| @VUnit@ means the computation finished without @return@; any other @Value@ is a return payload. -}
compYieldsUnit : Value -> Bool
compYieldsUnit v =
    case v of
        VUnit ->
            True

        _ ->
            False


{-| Result @Value@ is @VUnit@ for normal completion, or the returned expression’s value after @return@. -}
fwdComp : FunEnv -> Store -> Comp -> Result String ( Store, Value )
fwdComp gamma sigma c =
    case c of
        CSkip _ ->
            Ok ( sigma, VUnit )

        CAssign _ lhs rhs ->
            fwdExp gamma sigma rhs
                |> Result.andThen (\newVal -> assignValueToLhs gamma sigma lhs newVal)
                |> Result.map (\sigma1 -> ( sigma1, VUnit ))

        CAssignCall _ lhs fname argsExp ->
            if fname == "len" then
                evalCallArgs gamma sigma argsExp
                    |> Result.andThen arrayLenValue
                    |> Result.andThen (\n -> assignValueToLhs gamma sigma lhs (VInt n))
                    |> Result.map (\sigma1 -> ( sigma1, VUnit ))

            else
                case lookupFun fname gamma of
                    Nothing ->
                        Err ("fwdComp: unknown function " ++ fname)

                    Just ( pat, body ) ->
                        evalCallArgs gamma sigma argsExp
                            |> Result.andThen
                                (\argVal ->
                                    patMatch pat argVal
                                        |> Result.andThen
                                            (\binds ->
                                                let
                                                    sigmaCall =
                                                        extendStore binds sigma
                                                in
                                                fwdComp gamma sigmaCall body
                                                    |> Result.andThen
                                                        (\( sigmaBody, retV ) ->
                                                            if compYieldsUnit retV then
                                                                Err "fwdComp: function fell through without return"

                                                            else
                                                                let
                                                                    sigmaPopped =
                                                                        popParams pat sigmaBody
                                                                in
                                                                assignValueToLhs gamma sigmaPopped lhs retV
                                                                    |> Result.map (\sigmaOut -> ( sigmaOut, VUnit ))
                                                        )
                                            )
                                )

        CSeq _ c1 c2 ->
            fwdComp gamma sigma c1
                |> Result.andThen
                    (\( s1, r1 ) ->
                        if compYieldsUnit r1 then
                            fwdComp gamma s1 c2

                        else
                            Ok ( s1, r1 )
                    )

        CIf _ guard th el ->
            fwdExp gamma sigma guard
                |> Result.andThen
                    (\gv ->
                        case gv of
                            VBool True ->
                                fwdComp gamma sigma th

                            VBool False ->
                                fwdComp gamma sigma el

                            VHole _ _ ->
                                fwdComp gamma sigma th
                                    |> Result.andThen
                                        (\( sigmaT, vT ) ->
                                            fwdComp gamma sigma el
                                                |> Result.andThen
                                                    (\( sigmaF, vF ) ->
                                                        if compYieldsUnit vT && compYieldsUnit vF then
                                                            mergeStoresHoleGuard sigma sigmaT sigmaF
                                                                |> Result.map (\sigmaM -> ( sigmaM, VUnit ))

                                                        else
                                                            Err "fwdComp: hole guard requires both branches to yield VUnit"
                                                    )
                                        )

                            _ ->
                                Err "fwdComp: if guard must be boolean or hole"
                    )

        CWhile _ guard body ->
            fwdExp gamma sigma guard
                |> Result.andThen
                    (\gv ->
                        case gv of
                            VBool False ->
                                Ok ( sigma, VUnit )

                            VBool True ->
                                fwdComp gamma sigma (CSeq cSeqDefaultWSS body (CWhile cWhileDefaultWSS guard body))

                            VHole _ _ ->
                                let
                                    affected =
                                        uniqVars (globalAssignTargetsFromComp gamma [] body)

                                    sigmaMarked =
                                        List.foldl
                                            (\x acc ->
                                                storeSet x (VHole ("while-hole:" ++ x) sigma) acc
                                            )
                                            sigma
                                            affected
                                in
                                Ok ( sigmaMarked, VUnit )

                            _ ->
                                Err "fwdComp: while guard must be boolean or hole"
                    )

        CReturn _ rhs ->
            fwdExp gamma sigma rhs
                |> Result.map (\v -> ( sigma, v ))
