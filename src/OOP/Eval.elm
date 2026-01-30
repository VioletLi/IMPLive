module OOP.Eval exposing (..)

import OOP.Syntax exposing (..)
import OOP.Utils exposing (..)
import OOP.LangUtils exposing (..)
import Utils exposing (nth)
import OOP.Printer.Value exposing (printValue)
import Set exposing (insert, empty, union)
import Round
import List
import Tuple
-- import OOP.Parser.Term exposing (hole)



-- invks只在类成员方法调用的时候更新，记录调用了哪些方法。为什么要记录？
eval : HEnv -> Env -> State -> ClassTable -> Term -> List (HoleName, Int) -> EvalRes
eval henv env state classtb term holeCount=
    case term of

        TInt _ n -> {res = VInt n, state = state, invks = empty, holeIDs = holeCount}

        TFloat _ n -> {res = VFloat n, state = state, invks = empty, holeIDs = holeCount}

        TTrue _ -> {res = VTrue, state = state, invks = empty, holeIDs = holeCount}

        TFalse _ -> {res = VFalse, state = state, invks = empty, holeIDs = holeCount}

        TChar _ c -> {res = VChar c, state = state, invks = empty, holeIDs = holeCount}

        TString _ s ->
            {res = VString s, state = state, invks = empty, holeIDs = holeCount}

        TVar _ s ->
            case findByName s env of
                Nothing -> 
                    errEvalRes "No Such Variable : 01"

                Just v -> 
                    case v of
                        -- TODO: FIX
                        VFix t -> eval henv env state classtb (TFix [] t) holeCount
                        _ -> 
                            { res = v
                            , state = state
                            , invks = empty
                            , holeIDs = holeCount
                            }

        TLam _ p t -> 
            { res = VClosure p t env
            , state = state
            , invks = empty
            , holeIDs = holeCount
            }

        TApp _ t1 t2 ->
            let res1 = eval henv env state classtb t1 holeCount in
            case res1.res of
                VHole _ _ _ ->
                    let
                        n = findCount tempHoleCount res1.holeIDs in
                    {res = VHole (HInter (n+1)) env state, state = res1.state, invks = res1.invks, holeIDs = (tempHoleCount, n+1)::res1.holeIDs}


                VClosure p tf envf ->
                    case t2 of
                        TFix _ t -> 
                            case p of
                                PVar _ s -> eval henv ((s, VFix t)::envf) res1.state classtb tf res1.holeIDs
                                _      -> 
                                    errEvalRes "Recursion Error : 01."
                        _ ->  
                            let 
                                res2 =
                                    eval henv env res1.state classtb t2 res1.holeIDs
                                
                                envm =
                                    match p res2.res
                            in
                            case envm of
                                [(_, VError info)] -> errEvalRes info
                                _             -> 
                                    let

                                        res3 =
                                            eval henv (envm++envf) res2.state classtb tf res2.holeIDs
                                    in
                                        {res = res3.res, state = res3.state, invks = union res1.invks res2.invks |> union res3.invks, holeIDs = res3.holeIDs}

                _ -> errEvalRes "Not Applicable : 01."

        TLet _ p t1 t2 ->
            eval henv env state classtb (TApp [] (TLam [] p t2) t1) holeCount

        TLetrec _ p t1 t2 ->
            eval henv env state classtb 
                (TApp [] (TLam [] p t2) (TFix [] (TLam [] p t1))) holeCount

        TFix _ t ->
            eval henv env state classtb (TApp [] t (TFix [] t)) holeCount

        TCase _ (TVar _ s) branch ->
            case findByName s env of
                Just v ->
                    case v of
                        VHole _ _ _ ->
                            let n = findCount tempHoleCount holeCount in
                            { res = VHole (HInter (n + 1)) env state
                            , state = state
                            , invks = empty
                            , holeIDs = (tempHoleCount, n+1)::holeCount }
                        _ ->
                            let
                                res = 
                                    matchCase v branch 
                            in
                            case res.envm of
                                [(_, VError info)] -> errEvalRes info
                                _ -> eval henv (res.envm++env) state classtb res.ti holeCount
                
                Nothing ->
                    errEvalRes "No Such Variable : 02"
        
        THole _ hn ->
            let v = findOOPValue hn (env, state) henv
            in
                case v of
                    Nothing -> 
                        let n = findCount hn holeCount in 
                        let (newState, newHoleID) = setUnknownValue state state env holeCount in
                            { res = VHole (HInst hn (n+1)) env state
                            , state = newState
                            , invks = empty
                            , holeIDs = (hn, n+1)::newHoleID }
                    Just v_ -> 
                        { res = v_
                        , state = state
                        , invks = empty
                        , holeIDs = holeCount}

        TCons _ t1 t2 ->
        -- 只有tcons，x::_会出现这种情况，[x,_]不需要处理res2是hole的结果
            let 
                res1 =
                    eval henv env state classtb t1 holeCount

                res2 =
                    eval henv env res1.state classtb t2 res1.holeIDs
            in
                case res2.res of
                    VHole _ _ _ -> 
                        let n = findCount tempHoleCount res2.holeIDs in
                        {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = union res1.invks res2.invks, holeIDs = (tempHoleCount, (n+1))::res2.holeIDs}
                    _ ->
                        {res = VCons res1.res res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}

        TList _ t1 t2 ->
            let 
                res1 =
                    eval henv env state classtb t1 holeCount

                res2 =
                    eval henv env res1.state classtb t2 res1.holeIDs
            in
                {res = VCons res1.res res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}

        TNil _ -> {res = VNil, state = state, invks = empty, holeIDs = holeCount}

        TEmpList _ -> {res = VNil, state = state, invks = empty, holeIDs = holeCount}

        TTuple2 _ t1 t2 ->
            let 
                res1 =
                    eval henv env state classtb t1 holeCount

                res2 =
                    eval henv env res1.state classtb t2 res1.holeIDs
            in
                {res = VTuple2 res1.res res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}

        TTuple3 _ t1 t2 t3 ->
            let 
                res1 =
                    eval henv env state classtb t1 holeCount

                res2 =
                    eval henv env res1.state classtb t2 res1.holeIDs

                res3 =
                    eval henv env res2.state classtb t3 res2.holeIDs
            in
                {res = VTuple3 res1.res res2.res res3.res, state = res3.state, invks = union res1.invks res2.invks |> union res3.invks, holeIDs = res3.holeIDs}

        TBPrim _ op t1 t2 ->
            let 
                res1 = 
                    eval henv env state classtb t1 holeCount

                res2 = 
                    eval henv env res1.state classtb t2 res1.holeIDs
                
                invks =
                    union res1.invks res2.invks

                v1 = res1.res
                v2 = res2.res
            in
                case v1 of
                    VInt n1 ->
                        case v2 of
                            VInt n2 -> 
                                {res = intOp op n1 n2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                            
                            VFloat n2 ->
                                {res = floatOp op (toFloat n1) n2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                            
                            VHole _ _ _ ->
                                let 
                                    n = 
                                        findCount tempHoleCount res2.holeIDs
                                in
                                {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}

                            _ -> errEvalRes "Operand Error : 01."

                    VFloat n1 ->
                        case v2 of
                            VInt n2   -> 
                                {res = floatOp op n1 (toFloat n2), state = res2.state, invks = invks, holeIDs = res2.holeIDs}

                            VFloat n2 -> 
                                {res = floatOp op n1 n2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                            
                            VHole _ _ _ ->
                                let 
                                    n = 
                                        findCount tempHoleCount res2.holeIDs
                                in
                                {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}

                            _         -> errEvalRes "Operand Error : 02."

                    VTrue ->
                        case v2 of
                            VTrue ->
                                case op of
                                And -> {res = VTrue, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                Or  -> {res = VTrue, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                _   -> errEvalRes "Operator Error : 03."
                            
                            VFalse ->
                                case op of
                                    And -> {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    Or  -> {res = VTrue, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    _   -> errEvalRes "Operator Error: 04."
                            VHole _ _ _ ->
                                if op == And || op == Or then
                                    let 
                                        n = 
                                            findCount tempHoleCount res2.holeIDs
                                    in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 23."

                            _ -> errEvalRes "Operand Error : 03."

                    VFalse ->
                        case v2 of
                            VTrue ->
                                case op of
                                    And -> {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    Or  -> {res = VTrue, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    _   -> errEvalRes "Operator Error : 05."
                            
                            VFalse ->
                                case op of
                                    And -> {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    Or  -> {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                    _   -> errEvalRes "Operator Error : 06."

                            VHole _ _ _ ->
                                if op == And || op == Or then
                                    let 
                                        n = 
                                            findCount tempHoleCount res2.holeIDs
                                    in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 22."

                            _ ->
                                errEvalRes "Operand Error : 04."

                    VCons _ _ ->
                        case v2 of
                            VCons _ _ ->
                                if op == Cat then
                                    {res = appendValueList v1 v2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else if op == Eq then
                                    {res = if v1 == v2 then VTrue else VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 07."
                            
                            VNil ->
                                if op == Cat then
                                    {res = appendValueList v1 v2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else if op == Eq then
                                    {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 08."
                            VHole _ _ _ ->
                                if op == Cat || op == Eq then
                                    let n = findCount tempHoleCount res2.holeIDs in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 21."
                            _ ->
                                errEvalRes "Operand Error : 05."

                    VNil ->
                        case v2 of
                            VCons _ _ ->
                                if op == Cat then
                                    {res = appendValueList v1 v2, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else if op == Eq then
                                    {res = VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 09."
                            
                            VNil ->
                                if op == Cat then
                                    {res = VNil, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else if op == Eq then
                                    {res = VTrue, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 10."
                            VHole _ _ _ ->
                                if op == Cat || op == Eq then
                                    let 
                                        n = 
                                            findCount tempHoleCount res2.holeIDs
                                    in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else 
                                    errEvalRes "Operator Error : 19."
                            _ ->
                                errEvalRes "Operand Error : 07."

                    VChar c1 ->
                        case v2 of
                            VChar c2 ->
                                if op == Eq then 
                                    {res = if c1 == c2 then VTrue else VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 18"
                            VHole _ _ _ ->
                                if op == Eq then
                                    let 
                                        n = 
                                            findCount tempHoleCount res2.holeIDs
                                    in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 20."
                            _ -> errEvalRes "Oprand Error : 14"
                    
                    VString s1 ->
                        case v2 of
                            VString s2 ->
                                if op == Cat then
                                    {res = VString (s1 ++ s2), state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else if op == Eq then
                                    {res = if v1 == v2 then VTrue else VFalse, state = res2.state, invks = invks, holeIDs = res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 25."
                            VHole _ _ _ ->
                                if op == Eq || op == Cat then
                                    let 
                                        n = 
                                            findCount tempHoleCount res2.holeIDs
                                    in
                                    {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}
                                else
                                    errEvalRes "Operator Error : 24."

                            _ ->
                                errEvalRes "Operand Error : 12."
                    VHole _ _ _ ->
                        
                        let 
                            n = 
                                findCount tempHoleCount res2.holeIDs
                        in
                        {res = VHole (HInter (n+1)) env res2.state, state = res2.state, invks = invks, holeIDs = (tempHoleCount, n+1)::res2.holeIDs}

                    _ ->
                        errEvalRes "Operand Error : 08."

        TUPrim _ op t ->
            case op of
                Neg ->
                    let 
                        res =
                            eval henv env state classtb t holeCount
                    in
                        case res.res of
                            VInt n    ->
                                {res | res = VInt (0-n)}

                            VFloat n  ->
                                {res | res = VFloat (0-n)}

                            VHole _ _ _ ->
                        
                                let 
                                    n = 
                                        findCount tempHoleCount res.holeIDs
                                in
                                {res = VHole (HInter (n+1)) env res.state, state = res.state, invks = res.invks, holeIDs = (tempHoleCount, n+1)::res.holeIDs}

                            _         ->
                                errEvalRes "Operand Error : 09."
                Not ->
                    let 
                        res =
                            eval henv env state classtb t holeCount
                    in
                    case res.res of
                        VTrue     ->
                            {res | res = VFalse}
                        
                        VFalse    ->
                            {res | res = VTrue}

                        VHole _ _ _ ->
                        
                            let 
                                n = 
                                    findCount tempHoleCount res.holeIDs
                            in
                            {res = VHole (HInter (n+1)) env res.state, state = res.state, invks = res.invks, holeIDs = (tempHoleCount, n+1)::res.holeIDs}

    
                        _         ->
                            errEvalRes "Operand Error : 10."

        TParens _ t ->
            eval henv env state classtb t holeCount

        TRef _ t ->
            let
                res =
                    eval henv env state classtb t holeCount
            in
                {res = VLoc (List.length res.state), state = res.state++[res.res], invks = res.invks, holeIDs = res.holeIDs}

        TDeRef _ t ->
            let
                res =
                    eval henv env state classtb t holeCount
            in
                case res.res of
                    VLoc n ->
                        case nth n res.state of
                            Just val ->
                                {res = val, state = res.state, invks = res.invks, holeIDs = res.holeIDs}
                            
                            Nothing ->
                                errEvalRes "Index Out Of Range : 01."
                    VHole _ _ _ ->
                        let 
                                n = 
                                    findCount tempHoleCount res.holeIDs
                            in
                            {res = VHole (HInter (n+1)) env res.state, state = res.state, invks = res.invks, holeIDs = (tempHoleCount, n+1)::res.holeIDs}

                    _ -> errEvalRes "Not a Reference : 01."
                
        TAssign _ t1 t2 ->
            let
                res1 =
                    eval henv env state classtb t1 holeCount
                
                res2 =
                    eval henv env res1.state classtb t2 res1.holeIDs
            in
                case res1.res of
                    VLoc n ->
                        {res = VUnit, state = replace n res2.res res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}


                    _ -> errEvalRes "Not a Reference : 02."

        TUnit _ -> {res = VUnit, state = state, invks = empty, holeIDs = holeCount}

        TField _ t1 t2 ->
            case t2 of
                TVar _ f ->
                    let
                        res1 =
                            eval henv env state classtb t1 holeCount
                    in
                        case res1.res of
                        VHole _ _ _ ->
                                let
                                    n = findCount tempHoleCount res1.holeIDs in
                                {res = VHole (HInter (n+1)) env state, state = res1.state, invks = res1.invks, holeIDs = (tempHoleCount, n+1)::res1.holeIDs}
                                -- 需要把是谁调用的记录下来吗？记录也只是一个hole
                        VNew class args ->
                            let
                                fields =
                                    getFields class classtb

                                index =
                                    findFieldsIndex f (List.indexedMap Tuple.pair fields)

                                val =
                                    findIndexValueList index args
                            in
                                case val of
                                    Just v -> {res = v, state = res1.state, invks = res1.invks, holeIDs = res1.holeIDs}

                                    Nothing -> errEvalRes "No Such Field : 01."

                        _ -> errEvalRes "Not an Object : 01."

                _ -> errEvalRes "Not a Variable : 01."

        TInvk _ t1 t2 ->
            case t2 of
                TVar _ m ->
                    let
                        res1 =
                            eval henv env state classtb t1 holeCount
                    in
                        case res1.res of
                            VHole _ _ _ ->
                                let
                                    n = findCount tempHoleCount res1.holeIDs in
                                {res = VHole (HInter (n+1)) env state, state = res1.state, invks = res1.invks, holeIDs = (tempHoleCount, n+1)::res1.holeIDs}
                                -- 需要把是谁调用的记录下来吗？记录也只是一个hole
                            VNew class _ ->
                                let
                                    res =
                                        findMethod m class classtb
                                in
                                    case res of
                                        Just (_, (_, (_, p,t))) ->
                                            { res = VClosure p t (("this",res1.res)::env), state = res1.state
                                            , invks = insert (class, m) res1.invks, holeIDs = res1.holeIDs}

                                        Nothing ->
                                            errEvalRes "No Such Method : 01."

                            _ -> errEvalRes "Not an Object : 02."

                _ ->
                    errEvalRes "Not a Variable : 02."

        TNew _ class ts ->
            let
                res =
                    eval henv env state classtb ts holeCount
            in
                {res = VNew class res.res, state = res.state, invks = res.invks, holeIDs = res.holeIDs}

        TError info -> errEvalRes info

        TSeq _ t1 t2 ->
            let
                res1 =
                    eval henv env state classtb t1 holeCount
            in
            case res1.res of
                VHole _ _ _ ->
                    let
                        res2 =
                            eval henv env res1.state classtb t2 res1.holeIDs
                    in
                        {res = res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}
                VUnit ->
                    let
                        res2 =
                            eval henv env res1.state classtb t2 res1.holeIDs
                    in
                        {res = res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}
                _ -> errEvalRes "First term of sequence is not unit : 01."

        -- TLoc _ n -> (VLoc n, state)

        THtml _ s t1 t2 t3 ->
            let 
                res1 = 
                    eval henv env state classtb t1 holeCount

                res2 = 
                    eval henv env res1.state classtb t2 res1.holeIDs

                res3 = 
                    eval henv env res2.state classtb t3 res2.holeIDs
            in
                {res = VHtml s res1.res res2.res res3.res, state = res3.state, invks = union res1.invks res2.invks |> union res3.invks, holeIDs = res3.holeIDs}

        TToStr _ t ->
            let
                res =
                    eval henv env state classtb t holeCount
            in
            case res.res of
                VHole _ _ _ -> 
                    let 
                        n = 
                            findCount tempHoleCount res.holeIDs
                    in
                    {res = VHole (HInter (n+1)) env res.state, state = res.state, invks = res.invks, holeIDs = (tempHoleCount, n+1)::res.holeIDs}
                _ ->
                    {res = res.res |> printValue |> VString, state = res.state, invks = res.invks, holeIDs = res.holeIDs}

        TMap _ _ f ls ->
            let
                res1 =
                    eval henv env state classtb f holeCount

                res2 =
                    eval henv env res1.state classtb ls res1.holeIDs
                
                res3 =
                    vmap henv res1.res res2.res res2.state classtb res2.holeIDs
            in
                {res = res3.res, state = res3.state, invks = union res1.invks res2.invks |> union res3.invks, holeIDs = res3.holeIDs}

        TLoc _ n ->
            {res = VLoc n, state = state, invks = empty, holeIDs = holeCount}
        
        _ -> errEvalRes "No Such Term : 01."

errEvalRes : String -> EvalRes
errEvalRes info =
    { res = VError info
    , state = []
    , invks = empty
    , holeIDs = []
    }


boolOp : Bool -> Value
boolOp p =
    if p then VTrue else VFalse


intOp : Bop -> Int -> Int -> Value
intOp op n1 n2 =
    case op of
        -- Arith
        Add -> VInt (n1 + n2)
        Sub -> VInt (n1 - n2)
        Mul -> VInt (n1 * n2)
        Div -> VFloat (Round.roundNumCom 2 
                        <| ((toFloat n1) / (toFloat n2)))
        RDiv -> VInt (n1 // n2)
        -- Logic
        Eq -> boolOp (n1 == n2)
        Lt -> boolOp (n1 < n2)
        Gt -> boolOp (n1 > n2)
        Le -> boolOp (n1 <= n2)
        Ge -> boolOp (n1 >= n2)
        _  -> 
            VError "Operator Error : 01."


floatOp : Bop -> Float -> Float -> Value
floatOp op n1 n2 =
    case op of
        Add -> VFloat (Round.roundNumCom 2 <| n1 + n2)
        Sub -> VFloat (Round.roundNumCom 2 <| n1 - n2)
        Mul -> VFloat (Round.roundNumCom 2 <| n1 * n2)
        Div -> VFloat (Round.roundNumCom 2 <| n1 / n2)
        Eq -> boolOp (n1 == n2)
        Lt -> boolOp (n1 < n2)
        Gt -> boolOp (n1 > n2)
        Le -> boolOp (n1 <= n2)
        Ge -> boolOp (n1 >= n2)
        _  -> VError "Operator Error : 02."


vmap : HEnv -> Value -> Value -> State -> ClassTable -> List (HoleName, Int) -> EvalRes
vmap henv v1 v2 state classtb holeIDs =
    case v1 of
        VClosure p t envf ->
            case v2 of
                VCons v21 v22 ->
                    let 
                        envm =
                            match p v21
                    in
                    case envm of
                        [(_, VError info)] -> errEvalRes info
                        _             ->
                            let
                                res1 =
                                    eval henv (envm++envf) state classtb t holeIDs
                                
                                res2 =
                                    vmap henv res1.res v22 res1.state classtb res1.holeIDs
                            in
                                {res = VCons res1.res res2.res, state = res2.state, invks = union res1.invks res2.invks, holeIDs = res2.holeIDs}

                VNil ->
                    {res = VNil, state = state, invks = empty, holeIDs = holeIDs}

                _ ->
                    errEvalRes "The third argument to map_ must be a list : 01."

        _ ->
            errEvalRes "The second argument to map_ must be a function : 01."

findOOPValue : HoleName -> (Env, State) -> HEnv -> Maybe Value
findOOPValue u (env, state) henv =
    case henv of

        [] -> Nothing

        (u_, (env_, state_), v_)::ls ->
            if u_ == u && env_ == env && state_ == state
            then Just v_
            else findOOPValue u (env, state) ls