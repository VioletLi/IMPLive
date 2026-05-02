module Parser.Exp exposing (..)

import Parser exposing (..)
import Syntax exposing (..)
import Parser.Utils exposing (..)
import Parser.Extras exposing (..)
import Parser.Expression exposing (..)
import Parser.Pattern exposing (pattern)
import Parser.WhiteSpace exposing (..)

parse : String -> Result (List DeadEnd) Exp
parse =
    run (exp |. end)


exp : Parser Exp
exp =
    buildExpressionParser operators (lazy <| \_ -> app)


operators : OperatorTable Exp
operators =
    [ [Prefix (backtrackable (uop "-" Neg))]
    ,  [Prefix (uop "!" Not)]

    , [Infix (bop "%" Mod) AssocLeft]

    , [Infix (bop "*" Mul) AssocLeft
    --,  Infix (bop "/" Div) AssocLeft
    ]

    , [Infix (backtrackable (bop "+" Add)) AssocLeft
    ,  Infix (backtrackable (bop "-" Sub)) AssocLeft]

    , [Infix (bop "++" Cat) AssocLeft]

    , [Infix (backtrackable (bop "<" Lt)) AssocNone
    ,  Infix (backtrackable (bop ">" Gt)) AssocNone]

    , [Infix (bop "<=" Le) AssocNone
    ,  Infix (bop ">=" Ge) AssocNone]

    , [Infix (bop "==" Eq) AssocNone]
    , [Infix (bop "!=" Ne) AssocNone]
    , [Infix (bop "&&" And) AssocLeft]
    , [Infix (bop "||" Or) AssocLeft]

    , [Infix cons AssocRight]
    ]


uop : String -> Uop -> Parser (Exp -> Exp)
uop s op =
    succeed (\ws e -> EUPrim [ws] op e)
        |. symbol s
        |= mSpaces

bop : String -> Bop -> Parser (Exp -> Exp -> Exp)
bop s op =
    succeed (\ws e1 e2 -> EBPrim [ws] op e1 e2)
        |. symbol s
        |= mSpaces


app : Parser Exp
app =
    let
        foldl1 f (x, xs) =
            List.foldl (flip f) x xs
    in
        succeed (foldl1 EApp)
            |=  some (lazy <| \_ -> aexp)


flip : (a -> b -> c) -> b -> a -> c
flip f x y = f y x


aexp : Parser Exp
aexp =
    oneOf
    [ html
    , backtrackable parens_
    , backtrackable int_
    , backtrackable var
    , lazy (\_ -> abs)
    , lazy (\_ -> let_)
    , caseOf
    , backtrackable nil
    , backtrackable list
    , tuple
    , bool_
    , string
    , gui
    , event
    ]

-- TODO: add parens into syntax
parens_ : Parser Exp
parens_ =
    succeed (\s1 e s2 -> EParens [s1, s2] e)
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> exp)
        |. symbol ")"
        |= mSpaces


int_ : Parser Exp
int_ =
    succeed (\n ws -> EInt [ws] n)
        |= number
            { int = Just identity
            , hex = Just identity
            , octal = Just identity
            , binary = Just identity
            , float = Nothing
            }
        |= mSpaces


bool_ : Parser Exp
bool_ =
    oneOf [
        succeed (\ws -> EBool [ws] True)
        |. keyword "True"
        |= mSpaces
        ,

        succeed (\ws -> EBool [ws] False)
        |. keyword "False"
        |= mSpaces
    ]


string : Parser Exp
string =
    succeed (\s ws ->
            s |> String.toList >>
            List.foldr (\c acc-> ECons [" "] StringType (EChar [] c) acc) (ENil [] StringType)
            |> repWS [ws])
        |. symbol "\""
        |= mstring
        |. symbol "\""
        |= mSpaces

html : Parser Exp
html =
    succeed (\varName ws ->EHtml [ws] varName)
    |. keyword "Html"
    |. symbol "."
    |= varName
    |= mSpaces
    |= lazy (\_ -> aexp)
    |= lazy (\_ -> aexp)
    |= lazy (\_ -> aexp)

var : Parser Exp
var =
    succeed (\s ws -> EVar [ws] s  0)
    |= varName
    |= mSpaces


abs : Parser Exp
abs =
    succeed (\ws1 varName ws2 ws3 -> ELam [ws1, ws2, ws3] varName)
        |. symbol "\\"
        |= mSpaces
        |= varName
        |= mSpaces
        |. symbol "->"
        |= mSpaces
        |= lazy (\_ -> exp)


let_ : Parser Exp
let_ =
    succeed (
        \ws1 (wss1, elm) (wss2, ls) ws2 e ->
            let
                wss = (ws1:: wss1) ++ wss2 ++ [ws2]
            in
                ELet wss (elm::ls) e
        )
        |. keyword "let"
        |= mSpaces
        |= decl
        |= declloop
        |. keyword "in"
        |= mSpaces
        |= lazy (\_ -> exp)


declloop : Parser (WSS, Heap)
declloop =
    loop [] letHelper |> map heapListToExp


letHelper : List (WSS, Heap)  -> Parser (Step (List (WSS, Heap)) (List (WSS, Heap)))
letHelper  revDeclList =
    oneOf
    [ succeed (\ws (wss, elm) -> Loop ((ws :: wss, [elm]) :: revDeclList))
        |. symbol ","
        |= mSpaces
        |= lazy (\_ -> decl)
    , succeed ()
        |> map (\_ -> Done (List.reverse revDeclList))
    ]


decl : Parser (WSS, (String, ((Exp, Exp), Delta, (Maybe Value, Bool))))
decl =
    succeed (\p ws1 ws2 e -> ([ws1, ws2], (p, ((e, e), DZero, (Nothing, False)))))
        |= varName
        |= mSpaces
        |. symbol "="
        |= mSpaces
        |= lazy (\_ -> exp)


heapListToExp : List (WSS, Heap) -> (WSS, Heap)
heapListToExp declList =
    case declList of
        [] -> ([], [])
        (wsHead, heapHead) :: declListTail ->
            let
                (wsTail, heapTail) = heapListToExp declListTail
            in
                (wsHead ++ wsTail, heapHead ++ heapTail)


caseOf : Parser Exp
caseOf =
    succeed (\ws1 e ws2 -> ECase [ws1, ws2] e)
        |. keyword "case"
        |= mSpaces
        |= lazy (\_ -> exp)
        |. keyword "of"
        |= mSpaces
        |= branch


branch : Parser Branch
branch = buildExpressionParser branchOp sinBranch


sinBranch : Parser Branch
sinBranch =
    succeed (\p ws -> BSin [ws] p)
        |= lazy (\_ -> pattern)
        |. symbol "->"
        |= mSpaces
        |= lazy (\_ -> exp)


branchOp : OperatorTable Branch
branchOp = [[Infix ( succeed (\ws -> BCom [ws])
                        |. symbol "|"
                        |= mSpaces
                    )
            AssocRight]]


nil : Parser Exp
nil =
    succeed (\ws1 ws2 -> ENil [ws1, ws2] SquareType)
        |. symbol "["
        |= mSpaces
        |. symbol "]"
        |= mSpaces


list : Parser Exp
list =
    succeed (\ws1 e1 e2 ws2 -> ECons [ws1, ws2] SquareType e1 e2)
        |. symbol "["
        |= mSpaces
        |= lazy (\_ -> exp)
        |= listloop
        |. symbol "]"
        |= mSpaces


listloop : Parser Exp
listloop =
    loop [] listHelper |> (map (exprListToECons SquareType))


listHelper : List (WSS, Exp) -> Parser (Step (List (WSS, Exp)) (List (WSS, Exp)))
listHelper  revExps =
    oneOf
    [ succeed (\ws e -> Loop (([ws], e) :: revExps))
        |. symbol ","
        |= mSpaces
        |= lazy (\_ -> exp)
    , succeed ()
        |> map (\_ -> Done (List.reverse revExps))
    ]


exprListToECons : ListType -> List (WSS, Exp) -> Exp
exprListToECons lType ls =
    case ls of
        [] ->
            ENil [] SquareType

        (wss, e) :: es ->
            ECons wss lType e (exprListToECons lType es)


cons : Parser (Exp -> Exp -> Exp)
cons =
    succeed (\ws -> ECons [ws] ConsType)
        |. symbol "::"
        |= mSpaces


tuple : Parser Exp
tuple =
    succeed (\ws1 e1 ws2 e2 ws3 -> ETuple [ws1, ws2, ws3] TupleType e1 e2)
        |. symbol "("
        |= mSpaces
        |= lazy (\_ -> exp)
        |. symbol ","
        |= mSpaces
        |= lazy (\_ -> exp)
        |. symbol ")"
        |= mSpaces


gui : Parser Exp
gui =
    succeed (\ws e1 e2 -> ETuple [ws] GuiType e1 e2)
        |. keyword "Gui"
        |= mSpaces
        |= lazy (\_ -> aexp)
        |= lazy (\_ -> aexp)


event : Parser Exp
event =
    succeed (\ws e1 e2 -> ETuple [ws] EventType e1 e2)
        |. keyword "Event"
        |= mSpaces
        |= string
        |= lazy (\_ -> aexp)