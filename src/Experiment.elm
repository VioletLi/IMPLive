port module Experiment exposing (..)

import Browser exposing (..)
import Html exposing (..)

import Printer.Exp exposing (..)
import Syntax exposing (..)
import Parser exposing (..)
import Eval exposing (..)
import Parser.Delta exposing (delta)
import Parser.Exp exposing (parse)
import LangUtils.Fuse exposing (..)
import LangUtils.Preprocess exposing (..)
import LangUtils.Postprocess exposing (..)
import Preclude exposing (..)

import Tree.Diff exposing (..)
import Tree exposing (..)


main : Program () ExternalModel Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initExternalModel : ExternalModel
initExternalModel = { codeStr = "", deltaStr = "" }

init : () -> ( ExternalModel, Cmd Msg )
init _ = (initExternalModel, Cmd.none)

view : ExternalModel -> Html Msg
view _ =
    span [] []

update : Msg -> ExternalModel -> ( ExternalModel, Cmd Msg )
update msg model =
    case msg of
        Forward codeStr -> 
            let
                result = forward codeStr
            in
                case result of
                    Result.Ok output -> ( model, Cmd.none)
                    Result.Err err -> ( model, Cmd.none)

        Backward backwardInfo ->
            let
                result = backward backwardInfo.codeStr backwardInfo.deltaStr
            in
                case result of
                    Result.Ok output -> 
                        ( model
                        , sendBackwardResult 
                            { benchmark = backwardInfo.benchmark
                            , deltaName = backwardInfo.deltaName
                            , seqN = backwardInfo.seqN
                            , newCode = output
                            , oldCode = backwardInfo.codeStr
                            }
                        )
                    Result.Err err -> 
                        ( model
                        , sendBackwardResult 
                            { benchmark = backwardInfo.benchmark
                            , deltaName = backwardInfo.deltaName
                            , seqN = backwardInfo.seqN
                            , newCode = err
                            , oldCode = backwardInfo.codeStr
                            }
                        )

        Analysis analysisInfo ->
            let
                result = analysis analysisInfo.oldCode analysisInfo.newCode
            in
                case result of
                    Result.Ok resultInfo -> 
                        ( model
                        , sendAnalysisResult 
                            { benchmark = analysisInfo.benchmark
                            , deltaName = analysisInfo.deltaName
                            , diffHeight = Tuple.first resultInfo
                            , diffOperation = Tuple.second resultInfo
                            }
                        )
                    Result.Err err ->
                        ( model
                        , sendAnalysisResult 
                            { benchmark = analysisInfo.benchmark
                            , deltaName = analysisInfo.deltaName
                            , diffHeight = -1
                            , diffOperation = err
                            }
                        )

subscriptions : ExternalModel -> Sub Msg
subscriptions _ =
    Sub.batch 
        [ performBackward Backward
        , performAnalysis Analysis
        ]

forward : String -> Result String String
forward codeStr =
    case parse codeStr of
        Result.Ok code -> 
            case fwd [] code 0 of
                Result.Ok (h_fwd, e_fwd, _) -> Result.Ok (print e_fwd)
                Result.Err err -> Result.Err err

        Result.Err err -> Result.Err <| "ERROR #29 code parse error: " ++ codeStr


backward : String -> String -> Result String String
backward codeStr deltaStr =
    let
        result = 
            parse codeStr |> Result.andThen (\code ->
                run (delta |. end) deltaStr |> Result.map (\delta ->
                    let
                        (dv, heap1, _) = preproc delta 0

                        (h_bwd, exp_bwd, _) = bwd dv heap1 code 0

                        h_post_ = postprocessHeap h_bwd h_bwd

                        exp_post = postprocess exp_bwd h_post_
                    in
                        print exp_post
                )
            )
    in
        case result of
            Result.Ok output -> Result.Ok output
            Result.Err _     -> 
                Result.Err ("ERROR #30 code or delta parse error: " ++ codeStr ++ "\r\n" ++ deltaStr) 

analysis : String -> String -> Result String (Float, String)
analysis oldCode newCode =
    let
        result = 
            parse oldCode |> Result.andThen (\code1 ->
                parse newCode |> Result.andThen (\code2 ->
                    Result.Ok <| expDiff code1 code2
                )
            )
    in
        case result of 
            Result.Ok analysisResult -> Result.Ok analysisResult
            Result.Err _ -> Result.Err ("ERROR #31 code parse error: " ++ oldCode ++ "\r\n" ++ newCode)


expDiff : Exp -> Exp -> (Float, String)
expDiff exp1 exp2 =
    let
        tree1 = expToTree exp1
        tree2 = expToTree exp2
        diff = diffBy .label tree1 tree2

        (sumHeight, sumCount) = avgDiffHeight diff
    in
        (toFloat sumHeight / toFloat sumCount, Debug.toString diff)

avgDiffHeight : Diff TreeInfo -> (Int, Int)
avgDiffHeight diff = 
    case diff of
        Keep t -> (0, 0)
        Replace oldt newt -> (Tree.label oldt |> .height, 1)
        Copy label children tail ->
            let
                (sumHeight, sumCount) = 
                    List.foldr (\d (sumH, sumC) -> 
                        let
                            (h, c) = avgDiffHeight d
                        in
                            (sumH + h, sumC + c)
                    ) (0, 0) children

                (tailHeight, tailCount) = 
                    let
                        minChildHeightF = \t-> (label.minChildHeight * (List.length t), List.length t)
                    in
                        case tail of
                            Empty -> (0, 0)
                            Right tailList -> minChildHeightF tailList
                            Left  tailList -> 
                                List.foldr (\t (sumH, sumC) -> 
                                    let
                                        h = Tree.label t |> .height
                                    in
                                        (sumH + h, sumC + 1)
                                ) (0, 0) tailList
            in
                (sumHeight + tailHeight, sumCount + tailCount)
                  

expToTree : Exp -> Tree TreeInfo
expToTree exp =
    case exp of
        EInt  _ i          -> leaf <| "Int:"  ++ (Debug.toString i)
        EBool _ b          -> leaf <| "Bool:" ++ (Debug.toString b)
        EChar _ c          -> leaf <| "Char:" ++ (Debug.toString c)
        EVar _ x _         -> leaf <| "Var:"  ++ x
        ENil _ t           -> leaf <| "Nil:"  ++ Debug.toString t
        EError _           -> leaf <| "Error"

        EParens _ e        -> oneChildTree "Parens"                        (expToTree e)
        ELam _ v e         -> oneChildTree ("Lam:" ++ v)                   (expToTree e)
        EUPrim _ p e       -> oneChildTree ("UPrim: " ++ Debug.toString p) (expToTree e)

        EApp e1 e2         -> twoChildTree "App"                           (expToTree e1) (expToTree e2)
        ECons _ t e1 e2    -> 
            case t of
                StringType -> leaf <| "String:" ++ print exp
                _          -> twoChildTree ("Cons:" ++ Debug.toString t)   (expToTree e1) (expToTree e2)
        ETuple _ t e1 e2   -> twoChildTree ("Tuple:" ++ Debug.toString t)  (expToTree e1) (expToTree e2)
        ECase _ e b        -> twoChildTree "Case"                          (expToTree e)  (branchToTree b)
        EBPrim _ p e1 e2   -> twoChildTree ("BPrim: " ++ Debug.toString p) (expToTree e1) (expToTree e2)

        EHtml _ s e1 e2 e3 -> threeChildTree ("Html" ++ s) (expToTree e1) (expToTree e2) (expToTree e3)

        ELet _ h e         -> letToTree h (expToTree e)

letToTree : Heap -> Tree TreeInfo -> Tree TreeInfo
letToTree heap child =
    List.foldr (\(name, ((e, _), _, _)) acc -> threeChildTree "let" (leaf name) (expToTree e) acc) child heap

branchToTree : Branch -> Tree TreeInfo
branchToTree b = 
    case b of
        BSin _ p e   -> oneChildTree ("BSin:" ++ Debug.toString p) (expToTree e)
        BCom _ b1 b2 -> twoChildTree "BCom" (branchToTree b1) (branchToTree b2)


leaf : String -> Tree TreeInfo
leaf labelStr =
    singleton { label = labelStr, minChildHeight = 0, height = 0 }

oneChildTree : String -> Tree TreeInfo -> Tree TreeInfo
oneChildTree labelStr child =
    let
        minChildHeight = Tree.label child |> .minChildHeight
        childHeight = Tree.label child |> .height
        label = { label = labelStr, minChildHeight = minChildHeight, height = childHeight + 1 }
    in
        tree label [child]

twoChildTree : String -> Tree TreeInfo -> Tree TreeInfo -> Tree TreeInfo
twoChildTree labelStr child1 child2 =
    let
        child1Height = Tree.label child1 |> .height
        child2Height = Tree.label child2 |> .height
        label = 
            { label = labelStr
            , minChildHeight = (min child1Height child2Height)
            , height = (max child1Height child2Height) + 1
            }
    in
        tree label [child1, child2]

threeChildTree : String -> Tree TreeInfo -> Tree TreeInfo -> Tree TreeInfo -> Tree TreeInfo
threeChildTree labelStr child1 child2 child3 =
    let
        child1Height = Tree.label child1 |> .height
        child2Height = Tree.label child2 |> .height
        child3Height = Tree.label child3 |> .height
        label = 
            { label = labelStr
            , minChildHeight = (min (min child1Height child2Height) child3Height)
            , height = (max (max child1Height child2Height) child3Height) + 1
            }
    in
        tree label [child1, child2, child3]


type alias TreeInfo =
    { minChildHeight : Int
    , height : Int
    , label  : String
    }


type alias ExternalModel =
    { codeStr : String
    , deltaStr : String
    }

type alias BackwardInfo =
    { benchmark : String
    , deltaName : String
    , seqN : Int
    , codeStr : String
    , deltaStr : String
    } 

type alias UpdatedInfo =
    { benchmark : String
    , deltaName : String
    , seqN : Int
    , newCode : String
    , oldCode : String
    }

type alias AnalysisInfo =
    { benchmark : String
    , deltaName : String
    , newCode : String
    , oldCode : String
    }

type alias AnalysisResult =
    { benchmark : String
    , deltaName : String
    , diffHeight : Float
    , diffOperation : String
    }

type Msg
    = Forward String
    | Backward BackwardInfo
    | Analysis AnalysisInfo


port performForward : String -> Cmd msg
port performBackward : (BackwardInfo -> msg) -> Sub msg
port performAnalysis : (AnalysisInfo -> msg) -> Sub msg
port sendBackwardResult : UpdatedInfo -> Cmd msg 
port sendAnalysisResult : AnalysisResult -> Cmd msg
