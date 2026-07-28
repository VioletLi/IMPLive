module Newuneval exposing (..)

import Syntax exposing (..)
import Neweval exposing (eval)
import Newlangutils exposing (..)


type alias UnevalRes =
    { henv : HEnv
    , venv : VEnv
    , senv : SEnv
    , expr : Expr
    , stdin : Stdin
    , stdout : Stdout
    , funcSummary : FuncSummary
    , htotal : HTotal
    }

defaultUnevalRes : UnevalRes
defaultUnevalRes =
    { henv = []
    , venv = []
    , senv = []
    , expr = EError "Default Uneval Result"
    , stdin = ([], Normal)
    , stdout = ([], Normal)
    , funcSummary = []
    , htotal = 0
    }


type alias UpdateVal =
    { value : Value
    , senv : SEnv
    }

type alias TryUnevalRes =
    { res : UnevalRes
    , choice : Int
    , pi : Pattern
    }

uneval : Context -> Expr -> UpdateVal -> HTotal -> UnevalRes
uneval context expr updateval htotal =
    case expr of
        EParens ws e -> 
            let
                res = uneval context e updateval htotal 
            in
            { henv = res.henv
            , venv = res.venv
            , senv = res.senv
            , expr = EParens ws res.expr
            , funcSummary = res.funcSummary
            , stdin = res.stdin
            , stdout = res.stdout
            , htotal = res.htotal
            }
        EVar ws s -> 
            case (findVarByName s context.venv, updateval.value) of
                (Nothing, _) -> { defaultUnevalRes | expr = EError "Variable not found in uneval." }
                (Just (Loc l), M val) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updStore l val updateval.senv
                    , expr = EVar ws s
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , funcSummary = context.funcSummary
                    , htotal = htotal
                    }
                (Just _, IM val) ->
                    { henv = context.henv
                    , venv = updateEnv context.venv s val
                    , senv = updateval.senv
                    , expr = EVar ws s
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , funcSummary = context.funcSummary
                    , htotal = htotal
                    }
                _ -> { defaultUnevalRes | expr = EError "Error in var update." }
        ELam ws _ _ -> 
            case updateval.value of
                IM (VClosure p_ e_ venv_) ->
                    { henv = context.henv
                    , venv = venv_
                    , senv = updateval.senv
                    , expr = ELam ws p_ e_
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , funcSummary = context.funcSummary
                    , htotal = htotal
                    }
                _ ->
                    { defaultUnevalRes | expr = EError "Expected Closure." }
        ELet ws p e1 e2 -> 
            let fres = eval context e1 [] in
            let 
                newcontext = 
                    case (fres.value, p) of
                        (IM (VClosure pf ef venvf), PVar _ s) -> 
                            let (vs, r, w) = analyzeEffect context.funcSummary ef in
                            let factvs = unique (findCurVars vs context.venv) in
                            { senv = fres.senv, venv = (s, (VClosure pf ef venvf)) :: context.venv, stdin = fres.stdin, stdout = fres.stdout, funcSummary = ((s, (factvs, r, w))::context.funcSummary), henv = context.henv }
                        (IM (VFix ef), PVar _ s) -> 
                            let (vs, r, w) = analyzeEffect ((s, ([], False, False))::context.funcSummary) ef in
                            let factvs = unique (findCurVars vs context.venv) in
                            { senv = fres.senv, venv = (s, (VFix ef)) :: context.venv, stdin = fres.stdin, stdout = fres.stdout, funcSummary = ((s, (factvs, r, w))::context.funcSummary), henv = context.henv }
                        (M val, _) ->
                            let matchResult = match p val in
                            case matchResult of
                                [(_, VError info)] -> { senv = [VError info], venv = [], henv = [], stdin = ([], Normal), stdout = ([], Normal), funcSummary = []}
                                _ -> 
                                    let (venv, senv) = applyMatchResult matchResult context.venv context.senv in
                                    { senv = senv, venv = venv, henv = context.henv, stdin = fres.stdin, stdout = fres.stdout, funcSummary = context.funcSummary }
                        _ -> {venv = [], senv = [VError "Expected single variable when defining function"], henv = [], stdin = ([], Normal), stdout = ([], Normal), funcSummary = []}
            in
            case newcontext.senv of
                [VError info] -> { defaultUnevalRes | expr = EError info }
                _ ->
                    let res2 = uneval newcontext e2 updateval htotal in
                    case (fres.value, p) of
                        (IM _, PVar _ s) -> 
                            let 
                                updval = 
                                    case findVarByName s res2.venv of
                                        Just (VClosure p_ e_ venv_) -> { value = IM (VClosure p_ e_ venv_), senv = res2.senv }
                                        _ -> { value = M (VError "Expected variable when defining function"), senv = [] }
                            in
                            let res1 = uneval context e1 updval res2.htotal in
                            case res1.expr of
                                EError info -> { defaultUnevalRes | expr = EError info }
                                _ -> 
                                    {
                                        henv = mergeHEnv3 context.henv res1.henv res2.henv
                                        , venv = res1.venv
                                        , senv = res1.senv
                                        , expr = ELet ws p res1.expr res2.expr
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = res1.htotal
                                        , funcSummary = res1.funcSummary
                                    }
                        (M _, _) ->
                            let senv4e1 = rollbackSEnv context.venv context.senv res2.senv (collectVars p) in
                            case senv4e1 of
                                [VError info] -> { defaultUnevalRes | expr = EError info }
                                _ ->
                                    let newval = pattern2val p res2.venv res2.senv in
                                    let res1 = uneval context e1 { value = M newval, senv = senv4e1 } res2.htotal in
                                    {
                                        henv = mergeHEnv3 context.henv res1.henv res2.henv
                                        , venv = res1.venv
                                        , senv = res1.senv
                                        , expr = ELet ws p res1.expr res2.expr
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = res1.htotal
                                        , funcSummary = res1.funcSummary
                                    }
                        _ -> {defaultUnevalRes | expr = EError "Update Error in Let." }
                
        ELetrec ws (PVar ws1 s) e1 e2 -> 
            let func = eval context e1 [] in
            case func.value of
                IM (VFix ef) ->
                    let p = PVar ws1 s in
                    let (vs, r, w) = analyzeEffect context.funcSummary ef in
                    let factvs = unique (findCurVars vs context.venv) in
                    let newsum = (s, (factvs, r, w))::context.funcSummary in
                    let res = uneval {context| funcSummary = newsum} (EApp defaultWS (ELam defaultWS p e2) (EFix defaultWS (ELam defaultWS p e1))) updateval htotal in
                    case res.expr of
                        EError info -> {defaultUnevalRes | expr = EError info}
                        EApp _ (ELam _ p_ e2_) (EFix _ (ELam _ _ e1_)) ->
                            {res | expr = ELetrec ws p_ e1_ e2_}
                        _ -> {defaultUnevalRes | expr = EError "Wrong Result When Updating Letrec Statement."}
                _ -> {defaultUnevalRes | expr = EError "Expected Recursive Function Closure in Letrec." }
            -- case p of
            --     PVar _ x ->
            --         let venv_ = (x, length context.senv) :: context.venv in
            --         let fres = eval context e1 [] in
            --         case fres.value of
            --             VClosure _ _ _ ->
            --                 let res2 = uneval { venv = venv_, senv = fres.senv ++ [fres.value], henv = context.henv, stdin = fres.stdin, stdout = fres.stdout } e2 updateval htotal in
            --                 let newval = List.head (List.reverse (List.take ((List.length context.senv) + 1) res2.senv)) in
            --                 case newval of
            --                     Just val ->
            --                         let res1 = uneval context e1 { value = val, senv = List.take (List.length context.senv) res2.senv } res2.htotal in
            --                         {
            --                             henv = mergeHEnv3 context.henv res1.henv res2.henv
            --                             , venv = context.venv
            --                             , senv = res1.senv
            --                             , expr = ELetrec ws p res1.expr res2.expr
            --                             , stdin = context.stdin
            --                             , stdout = context.stdout
            --                             , htotal = res1.htotal
            --                         }
            --                     _ -> { defaultUnevalRes | expr = EError "Update Error in Letrec." }
            --             _ ->
            --                 {defaultUnevalRes | expr = EError "Expected Recursive Function in Letrec." }
            --     _ ->
            --         {defaultUnevalRes | expr = EError "Expected Recursive Function in Letrec." }
        EApp ws1 e1 (EFix ws2 e2) -> 
            let fres = eval context e1 [] in
            case fres.value of
                IM (VClosure (PVar ws s) e venv) -> 
                    let res = uneval {context | venv = (s, VFix e2) :: context.venv, senv = fres.senv,stdin = fres.stdin,stdout = fres.stdout} e updateval htotal in
                    case res.expr of 
                        EError info -> {defaultUnevalRes | expr = EError info}
                        _ -> 
                            let 
                                resf = uneval context e1 {value = IM (VClosure (PVar ws s) res.expr venv), senv = List.take (List.length fres.senv) res.senv} res.htotal
                            in
                            case resf.expr of
                                EError info -> {defaultUnevalRes | expr = EError info}
                                _ ->
                                    case findVarByName s res.venv of
                                        Just (VClosure fixP fixT fixEnv) -> 
                                                    let resfixclosure = uneval context (EFix defaultWS e2) {value = IM (VClosure fixP fixT fixEnv), senv = context.senv} resf.htotal
                                                    in 
                                                    {
                                                        henv = mergeHEnv3 context.henv res.henv resfixclosure.henv,
                                                        venv = context.venv,
                                                        senv = resf.senv,
                                                        expr = EApp ws1 resf.expr resfixclosure.expr,
                                                        stdin = context.stdin,
                                                        stdout = context.stdout,
                                                        htotal = resfixclosure.htotal,
                                                        funcSummary = resfixclosure.funcSummary
                                                    }
                                        Just (VFix e2_) -> 
                                            {
                                                henv = res.henv,
                                                venv = context.venv,
                                                senv = resf.senv,
                                                expr = EApp ws1 resf.expr (EFix ws2 e2_),
                                                stdin = context.stdin,
                                                stdout = context.stdout,
                                                htotal = resf.htotal,
                                                funcSummary = resf.funcSummary
                                            }
                                        _ -> {defaultUnevalRes | expr = EError "Error in update recusive function." }
                _ -> {defaultUnevalRes | expr = EError "Expected Closure in EApp." }
        EApp ws e1 e2 -> 
            let fres1 = eval context e1 [] in
            case fres1.value of
                IM (VClosure p e venv) ->
                    let fres2 = eval {context | senv = fres1.senv, stdin = fres1.stdin, stdout = fres1.stdout} e2 [] in
                    case fres2.value of
                        M fres2val ->
                            let matchResult = match p fres2val in
                                    case matchResult of
                                        [(_, VError info)] -> { defaultUnevalRes | expr = EError ("In EApp Update: "++info) }
                                        _ ->
                                            let (venv_, senv_) = applyArgs matchResult (length fres2.senv) in
                                            let resf = uneval {venv = venv_ ++ venv, senv = fres2.senv ++ senv_, henv = context.henv, stdin = fres2.stdin, stdout = fres2.stdout, funcSummary = context.funcSummary} e {updateval | senv = updateval.senv ++ senv_} htotal in
                                            case resf.expr of
                                                EError info -> { defaultUnevalRes | expr = EError ("Error In EApp Update: "++info) }
                                                _ -> 
                                                    let newval = pattern2val p resf.venv resf.senv in
                                                    let resargs = uneval {context | senv = fres1.senv, stdin = fres1.stdin, stdout = fres1.stdout} e2 {value = M newval, senv = List.take (List.length fres1.senv) resf.senv} resf.htotal in
                                                    case resargs.expr of
                                                        EError info -> { defaultUnevalRes | expr = EError ("Error In application args Update: "++info) }
                                                        _ -> 
                                                            let newclosure = VClosure p resf.expr venv in
                                                            let resfunc = uneval context e1 {value = IM newclosure, senv = resargs.senv} resargs.htotal in
                                                            {
                                                                henv = mergeHEnv3 context.henv resargs.henv resf.henv,
                                                                venv = mergeVEnv3 resfunc.venv resargs.venv context.venv,
                                                                senv = resfunc.senv,
                                                                expr = EApp ws resfunc.expr resargs.expr,
                                                                funcSummary = resfunc.funcSummary,
                                                                stdin = context.stdin,
                                                                stdout = context.stdout,
                                                                htotal = resfunc.htotal
                                                            }
                        _ -> {defaultUnevalRes | expr = EError "Closure as app argument in EApp Update." }
                _ -> {defaultUnevalRes | expr = EError "Expected Closure in eapp update." }
        EFix ws e -> 
            let res = uneval context (EApp defaultWS e (EFix defaultWS e)) updateval htotal in
            let newe = case res.expr of
                    EApp _ e1 (EFix _ e2) -> if e2 /= e then e2 else e1
                    _ -> EError "Wrong Result When Updating Fix Statement."
            in
            { res | expr = EFix ws newe }
        EInt ws _ -> 
            case updateval.value of
                M (VInt i_) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EInt ws i_
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                        { henv = context.henv
                        , venv = newvenv_
                        , senv = updateval.senv
                        , expr = EHole ws (HOri htotal)
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , htotal = htotal + 1
                        , funcSummary = context.funcSummary
                        }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected Int Constant." }
        EFloat ws _ -> 
            case updateval.value of
                M (VInt n_) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EFloat ws (toFloat n_)
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VFloat n_) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EFloat ws n_
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                        { henv = context.henv
                        , venv = newvenv_
                        , senv = updateval.senv
                        , expr = EHole ws (HOri htotal)
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , htotal = htotal + 1
                        , funcSummary = context.funcSummary
                        }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected Float Constant." }
        ETrue ws -> 
            case updateval.value of
                M VTrue ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = ETrue ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M VFalse ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EFalse ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                        { henv = context.henv
                        , venv = newvenv_
                        , senv = updateval.senv
                        , expr = EHole ws (HOri htotal)
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , htotal = htotal + 1
                        , funcSummary = context.funcSummary
                        }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected Bool Constant." }
        EFalse ws -> 
            case updateval.value of
                M VTrue ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = ETrue ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M VFalse ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EFalse ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                        { henv = context.henv
                        , venv = newvenv_
                        , senv = updateval.senv
                        , expr = EHole ws (HOri htotal)
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , htotal = htotal + 1
                        , funcSummary = context.funcSummary
                        }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected Bool Constant." }
        EChar ws _ -> 
            case updateval.value of
                M (VChar c_) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = EChar ws c_
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                        { henv = context.henv
                        , venv = newvenv_
                        , senv = newsenv_
                        , expr = EHole ws (HOri htotal)
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , htotal = htotal + 1
                        , funcSummary = context.funcSummary
                        }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected Char Constant." }
        ECons ws e1 e2 -> 
            case updateval.value of
                M (VCons id v1 v2) ->
                    let
                        fwdres = eval context e1 []
                        res2 = uneval { context | senv = fwdres.senv } e2 { updateval | value = M v2 } htotal
                        res1 = uneval context e1 { value = M v1, senv = res2.senv} res2.htotal
                        henv = mergeHEnv3 context.henv res1.henv res2.henv
                        venv = mergeVEnv3 context.venv res1.venv res2.venv
                    in
                    { henv = henv
                    , venv = venv
                    , senv = res1.senv
                    , expr = ECons ws res1.expr res2.expr
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = res2.htotal
                    , funcSummary = res1.funcSummary
                    }
                M (VNil id) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = ENil ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                    { henv = context.henv
                    , venv = newvenv_
                    , senv = updateval.senv
                    , expr = EHole ws (HOri htotal)
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal + 1
                    , funcSummary = context.funcSummary
                    }
                _ -> 
                    { defaultUnevalRes | expr = EError "Expected List in Cons." }
        ENil ws -> 
            case updateval.value of
                M (VNil _) ->
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = ENil ws
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                M (VHole _ (venv_, senv_)) ->
                    let
                        (newvenv_, newsenv_) = 
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                    { henv = context.henv
                    , venv = newvenv_
                    , senv = updateval.senv
                    , expr = EHole ws (HOri htotal)
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal + 1
                    , funcSummary = context.funcSummary
                    }
                M (VCons id v1 v2) ->
                    let (ne, htotal1) = valueToExpr (VCons id v1 v2) htotal in
                    let newe =
                            case ne of
                                ECons _ e1 e2 ->
                                    case ws of
                                        ([_, ws2], 5) ->
                                            changeWsForList ([" "], eoElm) e2
                                                |> ECons ([" ", ws2], eoSquare) e1
                                        
                                        (_, 1) ->
                                            changeWsForList ([], eoElm) ne

                                        ([ws1], 3) ->
                                            changeWsForList ([" "], esElm) e2
                                                |> ECons ([ws1], esQuo) e1
                                                
                                        (_, 4) ->
                                            changeWsForList ([], esElm) ne

                                        _ ->
                                            EError "Nil Expr WS Error."
                                
                                _ ->
                                    EError "Value To Expr Error."
                    in
                    { henv = context.henv
                    , venv = context.venv
                    , senv = updateval.senv
                    , expr = newe
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , htotal = htotal1 
                    , funcSummary = context.funcSummary
                    }
                _ -> {defaultUnevalRes | expr = EError "Expected List in Nil." }
        EHole ws u -> 
            let save = case updateval.value of
                    M (VInt n)        -> VInt n
                    M (VFloat n)      -> VFloat n
                    M VTrue         -> VTrue
                    M VFalse        -> VFalse
                    M (VCons id v1 v2)   -> VCons id v1 v2
                    M (VNil id)        -> VNil id
                    M (VBTuple v1 v2)   -> VBTuple v1 v2
                    M (VTTuple v1 v2 v3) -> VTTuple v1 v2 v3
                    M (VHole hn (venv, senv)) -> VHole hn (venv, senv)
                    _         -> VError ""
            in
            case save of
                VError _ ->
                    { defaultUnevalRes | expr = EError "Expected Value or Hole in EHole." }
                _ ->
                    case updateval.value of
                        M (VHole _ (venv_, senv_)) ->
                            let
                                (newvenv_, newsenv_) = 
                                    if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                            in
                                { henv = context.henv
                                , venv = newvenv_
                                , senv = updateval.senv
                                , expr = EHole ws u
                                , stdin = context.stdin
                                , stdout = context.stdout
                                , htotal = htotal + 1
                                , funcSummary = context.funcSummary
                                }
                        _ ->
                            let
                                henv = insert (u, (context.venv, context.senv), save) context.henv
                            in
                            { henv = henv
                            , venv = context.venv
                            , senv = updateval.senv
                            , expr = EHole ws u
                            , stdin = context.stdin
                            , stdout = context.stdout
                            , htotal = htotal + 1
                            , funcSummary = context.funcSummary
                            }
                    
        EBPrim ws op e1 e2 -> 
            let
                logic_ =
                    logic ws e1 e2 context updateval htotal

                arith_ = 
                    arith ws e1 e2 context updateval htotal

                comp_ = 
                    comp ws e1 e2 context updateval htotal
            in
            case op of
                And -> logic_ And
                Or  -> logic_ Or
                
                Add -> arith_ Add
                Sub -> arith_ Sub
                Mul -> arith_ Mul
                Div -> arith_ Div
                DDiv -> arith_ DDiv
                Cat -> arith_ Cat

                _ -> comp_ op
        EUPrim ws op e -> 
            let fres = eval context e [] in
            case op of
                Not ->
                    case fres.value of
                        M (VHole _ _) ->
                            case updateval.value of
                                M VTrue ->
                                    let 
                                        res =
                                            uneval context e { value = M VFalse, senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M VFalse ->
                                    let 
                                        res =
                                            uneval context e { value = M VTrue, senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M (VHole _ (venv_, senv_)) ->
                                    let
                                        (newvenv, newsenv) =
                                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                                    in
                                        { henv = context.henv
                                        , venv = newvenv
                                        , senv = newsenv
                                        , expr = EUPrim ws Not e
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = htotal
                                        , funcSummary = context.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 01" }

                        M VTrue ->
                            case updateval.value of
                                M VTrue ->
                                    let 
                                        res =
                                            uneval context e { value = M VFalse, senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M VFalse ->
                                    { henv = context.henv
                                    , venv = context.venv
                                    , senv = updateval.senv
                                    , expr = EUPrim ws Not e
                                    , stdin = context.stdin
                                    , stdout = context.stdout
                                    , htotal = htotal
                                    , funcSummary = context.funcSummary
                                    }

                                M (VHole hn (venv_, senv_)) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VHole hn (venv_, senv_)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 02" }


                        M VFalse ->
                            case updateval.value of
                                M VTrue ->
                                    { henv = context.henv
                                    , venv = context.venv
                                    , senv = updateval.senv
                                    , expr = EUPrim ws Not e
                                    , stdin = context.stdin
                                    , stdout = context.stdout
                                    , htotal = htotal
                                    , funcSummary = context.funcSummary
                                    }

                                M VFalse ->
                                    let 
                                        res =
                                            uneval context e { value = M VTrue, senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M (VHole hn (venv_, senv_)) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VHole hn (venv_, senv_)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Not res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 03" }
                        
                        _ -> { defaultUnevalRes | expr = EError "Unary Expression Error: 04" }

                Neg ->
                    case fres.value of
                        M (VHole _ _) ->
                            case updateval.value of
                                M (VInt n) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VInt (-n)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Neg res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M (VFloat n) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VFloat (-n)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Neg res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                M (VHole _ (venv_, senv_)) ->
                                    let
                                        (newvenv, newsenv) =
                                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                                    in
                                        { henv = context.henv
                                        , venv = newvenv
                                        , senv = newsenv
                                        , expr = EUPrim ws Neg e
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = htotal
                                        , funcSummary = context.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 05" }

                        M (VInt n) ->
                            case updateval.value of
                                M (VInt n_) ->
                                    if n == (-n_) then 
                                        { henv = context.henv
                                        , venv = context.venv
                                        , senv = updateval.senv
                                        , expr = EUPrim ws Neg e
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = htotal
                                        , funcSummary = context.funcSummary
                                        }
                                    else
                                        let
                                            res =
                                                uneval context e { value = M (VInt (-n_)), senv = updateval.senv } htotal
                                        in
                                            { henv = res.henv
                                            , venv = res.venv
                                            , senv = res.senv
                                            , expr = EUPrim ws Neg res.expr
                                            , stdin = res.stdin
                                            , stdout = res.stdout
                                            , htotal = res.htotal
                                            , funcSummary = res.funcSummary
                                            }

                                M (VHole hn (venv_, senv_)) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VHole hn (venv_, senv_)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , expr = EUPrim ws Neg res.expr
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 06" }

                        M (VFloat n) ->
                            case updateval.value of
                                M (VInt n_) ->
                                    if n == toFloat (-n_) then 
                                        { henv = context.henv
                                        , venv = context.venv
                                        , senv = updateval.senv
                                        , expr = EUPrim ws Neg e
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , htotal = htotal
                                        , funcSummary = context.funcSummary
                                        }
                                    else
                                        let 
                                            res =
                                                uneval context e { value = M (VFloat (toFloat (-n_))), senv = updateval.senv } htotal
                                        in
                                            { henv = res.henv
                                            , venv = res.venv
                                            , senv = res.senv
                                            , stdin = res.stdin
                                            , stdout = res.stdout
                                            , expr = EUPrim ws Neg res.expr
                                            , htotal = res.htotal
                                            , funcSummary = res.funcSummary
                                            }

                                M (VFloat n_) ->
                                    if n == (-n_) then 
                                        { henv = context.henv
                                        , venv = context.venv
                                        , senv = updateval.senv
                                        , stdin = context.stdin
                                        , stdout = context.stdout
                                        , expr = EUPrim ws Neg e
                                        , htotal = htotal
                                        , funcSummary = context.funcSummary
                                        }
                                    else
                                        let 
                                            res =
                                                uneval context e { value = M (VFloat (-n_)), senv = updateval.senv } htotal
                                        in
                                            { henv = res.henv
                                            , venv = res.venv
                                            , senv = res.senv
                                            , stdin = res.stdin
                                            , stdout = res.stdout
                                            , expr = EUPrim ws Neg res.expr
                                            , htotal = res.htotal
                                            , funcSummary = res.funcSummary
                                            }

                                M (VHole hn (venv_, senv_)) ->
                                    let 
                                        res =
                                            uneval context e { value = M (VHole hn (venv_, senv_)), senv = updateval.senv } htotal
                                    in
                                        { henv = res.henv
                                        , venv = res.venv
                                        , senv = res.senv
                                        , stdin = res.stdin
                                        , stdout = res.stdout
                                        , expr = EUPrim ws Neg res.expr
                                        , htotal = res.htotal
                                        , funcSummary = res.funcSummary
                                        }

                                _ -> 
                                    { defaultUnevalRes | expr = EError "Unary Expression Error: 07" }

                        
                        _ -> { defaultUnevalRes | expr = EError "Unary Expression Error: 08" }
        ECase ws e branches -> 
            let eres = eval context e [] in
            case (eres.value, updateval.value) of
                (M (VHole _ _), M (VHole _ (venv_, senv_))) -> 
                    {
                        henv = context.henv,
                        venv = venv_,
                        senv = senv_,
                        expr = ECase ws e branches,
                        stdin = context.stdin,
                        stdout = context.stdout,
                        htotal = htotal,
                        funcSummary = context.funcSummary
                    }
                (M eresval, M newval) -> 
                    let 
                        tryRes = 
                            case eresval of
                                VHole _ _ -> tryuneval eresval context branches updateval htotal
                                _ -> 
                                    let matchRes = matchCase eresval branches in
                                    let (venv_, senv_) = applyArgs matchRes.venvm (length eres.senv) in
                                    let bres = uneval {venv = venv_ ++ context.venv, senv = eres.senv ++ senv_, henv = context.henv, stdin = eres.stdin, stdout = eres.stdout, funcSummary = context.funcSummary} matchRes.ei { updateval | senv = updateval.senv ++ senv_} htotal in
                                    {res = bres, choice = matchRes.choice, pi = matchRes.pi}
                    in
                    case tryRes.res.expr of
                        EError info -> {defaultUnevalRes | expr = EError info}
                        _ -> 
                            let branches_ = updateBranch branches tryRes.choice tryRes.res.expr in
                            let newv = pattern2val tryRes.pi tryRes.res.venv tryRes.res.senv in
                            let rese = uneval context e {value = M newv, senv = List.take (List.length eres.senv) tryRes.res.senv} tryRes.res.htotal in
                            {
                                henv = mergeHEnv3 context.henv tryRes.res.henv rese.henv
                                , venv = mergeVEnv3 context.venv tryRes.res.venv rese.venv
                                , senv = rese.senv
                                , expr = ECase ws rese.expr branches_
                                , stdin = rese.stdin
                                , stdout = rese.stdout
                                , htotal = rese.htotal
                                , funcSummary = rese.funcSummary
                            }
                _ -> { defaultUnevalRes | expr = EError "Case Expression Modified Value Type Error: 01." }
        EBTuple ws e1 e2 -> 
            case updateval.value of
                M (VBTuple v1 v2) ->
                    let
                        res1 = eval context e1 []
                        res2_ = uneval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 { value = M v2, senv = updateval.senv } htotal
                        res1_ = uneval context e1 { value = M v1, senv = res2_.senv } res2_.htotal
                        henv = mergeHEnv3 context.henv res1_.henv res2_.henv
                        venv = mergeVEnv3 context.venv res1_.venv res2_.venv
                    in
                        { henv = henv
                        , venv = venv
                        , senv = res1_.senv
                        , expr = EBTuple ws res1_.expr res2_.expr
                        , stdin = res1_.stdin
                        , stdout = res1_.stdout
                        , htotal = res1_.htotal
                        , funcSummary = res1_.funcSummary
                        }
                _ -> { defaultUnevalRes | expr = EError "Expected BTuple." }
        ETTuple ws e1 e2 e3 -> 
            case updateval.value of
                M (VTTuple v1 v2 v3) ->
                    let
                        res1 = eval context e1 []
                        res2 = eval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 []
                        res3_ = uneval {context | senv = res2.senv, stdin = res2.stdin, stdout = res2.stdout} e3 { value = M v3, senv = updateval.senv } htotal
                        res2_ = uneval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 { value = M v2, senv = res3_.senv } res3_.htotal
                        res1_ = uneval context e1 { value = M v1, senv = res2_.senv } res2_.htotal
                        henv = mergeHEnv4 context.henv res1_.henv res2_.henv res3_.henv
                        venv = mergeVEnv4 context.venv res1_.venv res2_.venv res3_.venv
                    in
                        { henv = henv
                        , venv = venv
                        , senv = res1_.senv
                        , expr = ETTuple ws res1_.expr res2_.expr res3_.expr
                        , stdin = res1_.stdin
                        , stdout = res1_.stdout
                        , htotal = res1_.htotal
                        , funcSummary = res1_.funcSummary
                        }
                _ -> { defaultUnevalRes | expr = EError "Expected TTuple." }
        EPrint ws e -> defaultUnevalRes
        ERead ws -> defaultUnevalRes
        EError info -> { defaultUnevalRes | expr = EError info }
        _ -> { defaultUnevalRes | expr = EError "Unknown Expression Error." }


logic : WS -> Expr -> Expr -> Context -> UpdateVal -> HTotal -> Bop -> UnevalRes
logic ws e1 e2 context updateval htotal op =
    let
        res1 =
            eval context e1 []
        
        res2 =
            eval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 []

        res =
            eval context (EBPrim ws op e1 e2) []
        
        (newv1, newv2) =
            case (res.value, res1.value, res2.value) of
                (M VTrue, M val1, M val2) ->
                    case updateval.value of
                        M VTrue -> (val1, val2)

                        M VFalse ->
                            case (val1, val2, op) of
                                (VTrue, VTrue, And) ->
                                    (VFalse, VTrue)
                                
                                (VTrue, VFalse, Or) ->
                                    (VFalse, VFalse)

                                (VFalse, VTrue, Or) ->
                                    (VFalse, VFalse)

                                _ ->
                                    (VError "", VError "")
                        -- Preferentially select the second operand to become hole
                        M (VHole hn (venv_, senv_)) ->
                            (val1, VHole hn (venv_, senv_))
                        
                        _ ->
                            (VError "", VError "")
                
                (M VFalse, M val1, M val2) ->
                    case updateval.value of
                        M VFalse -> (val1, val2)

                        M VTrue ->
                            case (val1, val2, op) of
                                (VFalse, VFalse, Or) ->
                                    (VTrue, VFalse)

                                (VTrue, VFalse, And) ->
                                    (VTrue, VTrue)

                                (VFalse, VTrue, And) ->
                                    (VTrue, VTrue)

                                _ ->
                                    (VError "", VError "")
                        
                        M (VHole hn (venv_, senv_)) ->
                            (val1, (VHole hn (venv_, senv_)))

                        _ ->
                            (VError "", VError "")

                (M (VHole _ _), M val1, M val2) ->
                    case ((val1, val2, updateval.value), op) of
                        ((VHole _ _, VTrue, M VTrue), And) ->
                            (VTrue, VTrue)

                        ((VTrue, VHole _ _, M VTrue), And) ->
                            (VTrue, VTrue)

                        ((VHole _ _, VFalse, M VFalse), Or) ->
                            (VFalse, VFalse)

                        ((VFalse, VHole _ _, M VFalse), Or) ->
                            (VFalse, VFalse)

                        _ ->
                            (VError "", VError "")
                
                _ ->
                    (VError "", VError "")
    in
    case (newv1, newv2) of
        (VError _, VError _) ->
            { defaultUnevalRes | expr = EError "Missing Information or Logic Expression Error." }

        _ ->
            operationUpdate context htotal ws op e1 e2 updateval newv1 newv2


arith : WS -> Expr -> Expr -> Context -> UpdateVal -> HTotal -> Bop -> UnevalRes
arith ws e1 e2 context updateval htotal op =
    let
        res1 =
            eval context e1 []
        
        res2 =
            eval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 []
    in
    case updateval.value of
        M (VHole _ (venv_, senv_)) ->
            case res1.value of
                M (VHole _ _) ->
                    let
                        (newvenv, newsenv) =
                            if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                    in
                    { henv = context.henv
                    , venv = newvenv
                    , senv = newsenv
                    , stdin = context.stdin
                    , stdout = context.stdout
                    , expr = EBPrim ws op e1 e2
                    , htotal = htotal
                    , funcSummary = context.funcSummary
                    }
                
                _ ->
                    case res2.value of
                        M (VHole _ _) ->
                            let
                                (newvenv, newsenv) =
                                    if venv_ == [] then (context.venv, context.senv) else (venv_, senv_)
                            in
                            { henv = context.henv
                            , venv = newvenv
                            , senv = newsenv
                            , stdin = context.stdin
                            , stdout = context.stdout
                            , expr = EBPrim ws op e1 e2
                            , htotal = htotal
                            , funcSummary = context.funcSummary
                            }
                        
                        _ ->
                            let
                                res2_ =
                                    uneval { context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 updateval htotal
                                res1_ = uneval context e1 {value = res1.value, senv = res2_.senv} res2_.htotal
                            in
                                { henv = res1_.henv
                                , venv = res1_.venv
                                , senv = res1_.senv
                                , expr = EBPrim ws op res1_.expr res2_.expr
                                , stdin = res1_.stdin
                                , stdout = res1_.stdout
                                , htotal = res1_.htotal
                                , funcSummary = res1_.funcSummary
                                }
        
        M (VInt n) ->
            let
                (newv1, newv2) =
                    case (res1.value, res2.value) of
                        (M (VHole _ _), M (VHole _ _)) -> 
                            case op of
                                Add -> (VInt n, VInt 0)
                                Sub -> (VInt n, VInt 0)
                                Mul -> (VInt n, VInt 1)
                                Div -> (VInt n, VInt 1)
                                DDiv -> (VInt n, VInt 1)
                                _   -> (VError "", VError "")

                        (M (VInt n1), M (VHole _ _))   ->
                            case op of
                                Add -> (VInt n1, VInt (n - n1))
                                Sub -> (VInt n1, VInt (n1 - n))
                                Mul -> (VInt n1, VFloat ((toFloat n) / (toFloat n1)))
                                Div -> (VInt n1, VInt (n1 // n))
                                DDiv -> (VInt n1, VFloat ((toFloat n1) / (toFloat n)))
                                _   -> (VError "", VError "")

                        (M (VHole _ _), M (VInt n2))   ->
                            case op of
                                Add -> (VInt (n - n2), VInt n2)
                                Sub -> (VInt (n + n2), VInt n2)
                                Mul -> (VFloat ((toFloat n) / (toFloat n2)), VInt n2)
                                Div -> (VInt (n * n2), VInt n2)
                                DDiv -> (VInt (n * n2), VInt n2)
                                _   -> (VError "", VError "")

                        (M (VFloat n1), _) ->
                            case op of
                                Add -> (VFloat n1, VFloat ((toFloat n) - n1))
                                Sub -> (VFloat n1, VFloat (n1 - (toFloat n)))
                                Mul -> (VFloat n1, VFloat ((toFloat n) / n1))
                                Div -> (VFloat n1, VFloat (n1 / (toFloat n)))
                                DDiv -> (VFloat n1, VFloat (n1 / (toFloat n)))
                                _   -> (VError "", VError "")
                        
                        (_, M (VFloat n2)) ->
                            case op of
                                Add -> (VFloat ((toFloat n) - n2), VFloat n2)
                                Sub -> (VFloat ((toFloat n) + n2), VFloat n2)
                                Mul -> (VFloat ((toFloat n) / n2), VFloat n2)
                                Div -> (VFloat ((toFloat n) * n2), VFloat n2)
                                DDiv -> (VFloat ((toFloat n) * n2), VFloat n2)
                                _   -> (VError "", VError "")
                        
                        (M (VInt n1), M (VInt n2)) ->
                            case op of
                                Add -> (VInt n1, VInt (n - n1))
                                Sub -> (VInt n1, VInt (n1 - n))
                                Mul ->
                                    if (n1 * n2) == n then
                                        (VInt n1, VInt n2)
                                    else
                                        (VInt n1, VInt (n // n1))
                                Div ->
                                    if (n1 // n2) == n then
                                        (VInt n1, VInt n2)
                                    else
                                        (VInt n1, VInt (n1 // n))
                                DDiv ->
                                    if (n1 // n2) == n then
                                        (VInt n1, VInt n2)
                                    else
                                        (VInt n1, VInt (n1 // n))
                                _   -> (VError "", VError "")
                        
                        _ -> (VError "", VError "")
            in
            case (newv1, newv2) of
                (VError _, VError _) ->
                    { defaultUnevalRes | expr = EError "Missing Information or Operands Type Error: 01." }
                
                _ ->
                    operationUpdate context htotal ws op e1 e2 updateval newv1 newv2

        M (VFloat n) ->
            let
                (newv1, newv2) =
                    case (res1.value, res2.value) of
                        (M (VHole _ _), M (VHole _ _)) ->
                            case op of
                                Add -> (VFloat n, VFloat 0)
                                Sub -> (VFloat n, VFloat 0)
                                Mul -> (VFloat n, VFloat 1)
                                Div -> (VFloat n, VFloat 1)
                                DDiv -> (VFloat n, VFloat 1)
                                _   -> (VError "", VError "")
                        
                        (M (VInt n1), M (VHole _ _)) ->
                            case op of
                                Add -> (VInt n1, VFloat (n - (toFloat n1)))
                                Sub -> (VInt n1, VFloat ((toFloat n1) - n))
                                Mul -> (VInt n1, VFloat (n / (toFloat n1)))
                                Div -> (VInt n1, VInt (n1 // (round n)))
                                DDiv -> (VInt n1, VFloat ((toFloat n1) / n))
                                _   -> (VError "", VError "")
                        
                        (M (VHole _ _), M (VInt n2))   ->
                            case op of
                                Add -> (VFloat (n - (toFloat n2)), VInt n2)
                                Sub -> (VFloat (n + (toFloat n2)), VInt n2)
                                Mul -> (VFloat (n / (toFloat n2)), VInt n2)
                                Div -> (VInt ((round n) * n2), VInt n2)
                                DDiv -> (VFloat (n * (toFloat n2)), VInt n2)
                                _   -> (VError "", VError "")
                        
                        (M (VFloat n1), _) ->
                            case op of
                                Add -> (VFloat n1, VFloat (n - n1))
                                Sub -> (VFloat n1, VFloat (n1 - n))
                                Mul -> (VFloat n1, VFloat (n / n1))
                                Div -> (VFloat n1, VFloat (n1 / n))
                                DDiv -> (VFloat n1, VFloat (n1 / n))
                                _   -> (VError "", VError "")
                        
                        (_, M (VFloat n2)) ->
                            case op of
                                Add -> (VFloat (n - n2), VFloat n2)
                                Sub -> (VFloat (n + n2), VFloat n2)
                                Mul -> (VFloat (n / n2), VFloat n2)
                                Div -> (VFloat (n * n2), VFloat n2)
                                DDiv -> (VFloat (n * n2), VFloat n2)
                                _   -> (VError "", VError "")

                        (M (VInt n1), M (VInt _)) ->
                            case op of
                                DDiv -> (VInt n1, VInt (Basics.round ((toFloat n1) / n)))
                                _   -> (VError "", VError "")
                        
                        _ -> (VError "", VError "")
            in
            case (newv1, newv2) of
                (VError _, VError _) ->
                    { defaultUnevalRes | expr = EError "Missing Informatin or Operands Type Error: 02." }
                
                _ ->
                    operationUpdate context htotal ws op e1 e2 updateval newv1 newv2

        M (VCons _ _ _) ->
            case (res1.value, updateval.value) of
                (M val1, M newv) ->
                    if op == Cat then
                        let
                            (newv1, newv2) =
                                deAppend newv (vlength val1)
                        in
                            operationUpdate context htotal ws op e1 e2 updateval newv1 newv2

                    else
                        { defaultUnevalRes | expr = EError "Arith Expression Modified Value Type Error: 01." }
                _ -> {defaultUnevalRes | expr = EError "Arith Expression Modified Value Type Error: 02."}

        M (VNil _) ->
            if op == Cat then
                operationUpdate context htotal ws op e1 e2 updateval (VNil 0) (VNil 0)
            else
                { defaultUnevalRes | expr = EError "Arith Expression Modified Value Type Error: 02." }

        _ -> 
            { defaultUnevalRes | expr = EError "Arith Expression Modified Value Type Error: 03." }

comp : WS -> Expr -> Expr -> Context -> UpdateVal -> HTotal -> Bop -> UnevalRes
comp ws e1 e2 context updateval htotal op =
    let
        res1 =
            eval context e1 []
        
        res2 =
            eval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 []
    in
    case updateval.value of
        M VTrue ->
            case op of
                Eq ->
                    let 
                        (newv1, newv2) =
                            case (res1.value, res2.value) of
                                (M (VInt n1), M (VHole _ _))   -> (VInt n1, VInt n1)
                                (M (VHole _ _), M (VInt n2))   -> (VInt n2, VInt n2)
                                (M (VFloat n1), M (VHole _ _)) -> (VFloat n1, VFloat n1)
                                (M (VHole _ _), M (VFloat n2)) -> (VFloat n2, VFloat n2)
                                (M VTrue, M (VHole _ _))  -> (VTrue, VTrue)
                                (M (VHole _ _), M VTrue)  -> (VTrue, VTrue)
                                (M VFalse, M (VHole _ _)) -> (VFalse, VFalse)
                                (M (VHole _ _), M VFalse) -> (VFalse, VFalse)
                                _ -> (VError "", VError "")
                    in
                    case (newv1, newv2) of
                        (VError _, VError _) ->
                            { defaultUnevalRes | expr = EError "Missing Information, Cannot Infer: 01." }
                        _ ->
                            operationUpdate context htotal ws op e1 e2 updateval newv1 newv2

                _ ->
                    let
                        res =
                            eval context (EBPrim ws op e1 e2) [] 
                        
                        newe =
                            case res.value of
                                M VTrue -> EBPrim ws op e1 e2
                                M VFalse ->
                                    case op of
                                        Lt -> EBPrim ws Ge e1 e2
                                        Gt -> EBPrim ws Le e1 e2
                                        Le -> EBPrim ws Gt e1 e2
                                        Ge -> EBPrim ws Lt e1 e2
                                        _  ->
                                            EError "Comparison Expression Modified Type Error: 01."
                                _ ->
                                    EError "Missing Information, Cannot Infer: 02."
                    in
                        { henv = context.henv
                        , venv = context.venv
                        , senv = updateval.senv
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , expr = newe
                        , htotal = htotal
                        , funcSummary = context.funcSummary
                        } 

        M VFalse ->
            let
                res =
                    eval context (EBPrim ws op e1 e2) [] 
                
                newe =
                    case res.value of
                        M VFalse -> EBPrim ws op e1 e2
                        M VTrue ->
                            case op of
                                Lt -> EBPrim ws Ge e1 e2
                                Gt -> EBPrim ws Le e1 e2
                                Le -> EBPrim ws Gt e1 e2
                                Ge -> EBPrim ws Lt e1 e2
                                Eq -> EError "Missing Information, Cannot Infer: 03."
                                _  -> EError "Comparison Expression Modified Type Error: 02."
                        _ ->
                            EError "Missing Information, Cannot Infer: 04."
            in
                { henv = context.henv
                , venv = context.venv
                , senv = updateval.senv
                , stdin = context.stdin
                , stdout = context.stdout
                , expr = newe
                , htotal = htotal
                , funcSummary = context.funcSummary
                } 

        M (VHole hn (venv_, senv_)) ->
            case (res1.value, res2.value) of
                (M (VHole _ _), _) ->
                    let
                        newvenv =
                            if venv_ == [] then context.venv else venv_
                    in
                        { henv = context.henv
                        , venv = newvenv
                        , senv = updateval.senv
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , expr = EBPrim ws op e1 e2
                        , htotal = htotal
                        , funcSummary = context.funcSummary
                        } 
                
                (_, M (VHole _ _)) ->
                    let
                        newvenv =
                            if venv_ == [] then context.venv else venv_
                    in
                        { henv = context.henv
                        , senv = updateval.senv
                        , stdin = context.stdin
                        , stdout = context.stdout
                        , venv = newvenv
                        , expr = EBPrim ws op e1 e2
                        , htotal = htotal
                        , funcSummary = context.funcSummary
                        } 

                (_, _) ->
                    let 
                        res2_ =
                            uneval {context | senv = res1.senv, stdin = res1.stdin, stdout = res1.stdout} e2 { value = M (VHole hn (venv_, senv_)), senv = updateval.senv } htotal
                        res1_ = uneval context e1 { value = res1.value, senv = res2_.senv} res2_.htotal
                        henv = mergeHEnv3 context.henv res1_.henv res2_.henv
                        venv = mergeVEnv3 context.venv res1_.venv res2_.venv
                    in
                        { henv = henv
                        , venv = venv
                        , senv = res1_.senv
                        , expr = EBPrim ws op e1 res1_.expr
                        , stdin = res1_.stdin
                        , stdout = res1_.stdout
                        , htotal = res1_.htotal
                        , funcSummary = res1_.funcSummary
                        }

        _ ->
            { defaultUnevalRes | expr = EError "Comparison Expression Modified Type Error: 03." }

operationUpdate : Context -> HTotal -> WS -> Bop -> 
            Expr -> Expr -> UpdateVal -> MValue -> MValue -> UnevalRes
operationUpdate context htotal ws op e1 e2 updateval newv1 newv2 =
    let
        fres1 = eval context e1 []
        res2 = uneval { context | senv = fres1.senv, stdin = fres1.stdin, stdout = fres1.stdout} e2 { value = M newv2, senv = updateval.senv } htotal
        res1 = uneval context e1 { value = M newv1, senv = res2.senv} res2.htotal
        henv = mergeHEnv3 context.henv res1.henv res2.henv
        venv = mergeVEnv3 context.venv res1.venv res2.venv
    in
    { henv = henv
    , venv = venv
    , senv = res1.senv
    , expr = EBPrim ws op res1.expr res2.expr
    , stdin = res1.stdin
    , stdout = res1.stdout
    , htotal = res1.htotal
    , funcSummary = res1.funcSummary
    }
    

collectVars : Pattern -> List String
collectVars p = 
    case p of
        PVar _ x -> [x]
        PBTuple _ p1 p2 -> collectVars p1 ++ collectVars p2
        PTTuple _ p1 p2 p3 -> collectVars p1 ++ collectVars p2 ++ collectVars p3
        PCons _ p1 p2 -> collectVars p1 ++ collectVars p2
        _ -> []

divideVars : List String -> List (String, Int) -> (List String, List String)
divideVars vars venv =
    let
        envvars = unique (List.map (\(x, _) -> x) venv)
        newVars = List.filter (\x -> not (List.member x envvars)) vars
    in
    (newVars, List.filter (\x -> not (List.member x newVars)) vars)

rollbackSEnv : VEnv -> SEnv -> SEnv -> List String -> SEnv
rollbackSEnv venv oldSenv newSenv vars =
    case vars of
        [] -> newSenv
        x :: xs ->
            case findVarByName x venv of
                Just (Loc l) ->
                    let oriVal = findValByLoc l oldSenv in
                    case oriVal of
                        VError info -> [VError info]
                        _ ->
                            rollbackSEnv venv oldSenv (updStore l oriVal newSenv) xs
                Just _ -> [VError "Pattern2Val: Variable maps to function closure"]
                Nothing ->
                    rollbackSEnv venv oldSenv (List.take (List.length newSenv - 1) newSenv) xs

pattern2val : Pattern -> VEnv -> SEnv -> MValue
pattern2val p venv senv =
    case p of
        PVar _ x ->
            case findVarByName x venv of
                Just (Loc l) -> findValByLoc l senv
                Just _ -> VError "Pattern2Val: Variable maps to function closure"
                Nothing -> VError "Pattern2Val: Variable not found"
        PBTuple _ p1 p2 ->
            VBTuple (pattern2val p1 venv senv) (pattern2val p2 venv senv)
        PTTuple _ p1 p2 p3 ->
            VTTuple (pattern2val p1 venv senv) (pattern2val p2 venv senv) (pattern2val p3 venv senv)
        PCons _ p1 p2 ->
            VCons 0 (pattern2val p1 venv senv) (pattern2val p2 venv senv)
        PNil _ ->
            VNil 0
        PInt _ n ->
            VInt n
        PFloat _ f ->
            VFloat f
        PTrue _ ->
            VTrue
        PFalse _ ->
            VFalse
        PChar _ c ->
            VChar c
        PUnit _ ->
            VUnit

tryuneval : MValue -> Context -> Branch -> UpdateVal -> HTotal -> TryUnevalRes
tryuneval v context b updateval htotal =
    case b of
        BNSin _ n pi ei ->
            let
                matchRes =
                    match pi v
            in

            case matchRes of
                [(_, VError info)] -> 
                    let r = {defaultUnevalRes | expr = EError info} in
                    {res = r, choice = 0, pi = PNil defaultWS}
                _ ->
                    let (venv_, senv_) = applyArgs matchRes (length context.senv) in
                    let bres = uneval {context | venv = venv_ ++ context.venv, senv = context.senv ++ senv_} ei { updateval | senv = updateval.senv ++ senv_} htotal in
                    case bres.expr of
                        EError info -> {res = {defaultUnevalRes | expr = EError info}, choice = 0, pi = PNil defaultWS}
                        _ -> 
                            let (venv__, senv__) = (List.take (List.length context.senv) bres.venv, List.take (List.length bres.senv) bres.senv) in
                            let bres_ = {bres | venv = venv__, senv = senv__} in
                            {res = bres_, choice = n, pi = pi}
                

        BCom _ b1 b2 ->
            let
                tryres =
                    tryuneval v context b1 updateval htotal
            in
            case tryres.res.expr of
                EError _ ->
                    tryuneval v context b2 updateval htotal

                _ -> tryres

        _ ->
            {res = {defaultUnevalRes | expr = EError "Try Uneval Error."}, choice = 0, pi = PNil defaultWS}


updateEnv : VEnv -> String -> IMValue -> VEnv
updateEnv venv s val =
    case venv of
        [] -> []
        (x, v) :: xs -> if x == s then (x, val) :: xs else (x, v) :: (updateEnv xs s val)