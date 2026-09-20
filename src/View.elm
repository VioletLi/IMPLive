module View exposing (..)

import Dict
import Html exposing (Html)
import Html.Attributes as Attr
import Html.Events as Events
import IMP.Printer exposing (printHoleName, printStmt, printStore, printValue)
import IMP.Syntax exposing (..)
import IMP.Utils exposing (exprHoleKey)
import Model exposing (Model, Msg(..))
import Set


view : Model -> Html Msg
view model =
    Html.div [ Attr.id "bi-preview" ]
        [ Html.div [ Attr.id "menu-bar" ]
            [ Html.div [ Attr.id "title" ]
                [ Html.text "IMPLive" ]
            , Html.button [ Attr.id "run-program", Attr.class "btn" ]
                [ Html.text "Eval" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick OpenInput ]
                [ Html.text "Input" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick FillAndResume ]
                [ Html.text "Fill-and-Resume" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick Preview ]
                [ Html.text "Uneval and Preview" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick Update ]
                [ Html.text "Uneval and Update" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick Revert ]
                [ Html.text "Revert Code" ]
            , Html.button [ Attr.class "btn uneval", Events.onClick ClearHB ]
                [ Html.text "Clear Hole-Bindings" ]
            ]
        , Html.div
            [ Attr.id "hole-bindings"
            , Attr.style "overflow-y" "scroll"
            ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "HOLE BINDINGS" ]
            , Html.table [ Attr.id "hb-table" ]
                ([ Html.th [ Attr.class "hole-name" ] [ Html.text "Hole Name" ]
                 , Html.th [] [ Html.text "Context" ]
                 , Html.th [ Attr.class "hole-value" ] [ Html.text "Value" ]
                 ]
                    ++ displayHB model.holeBindings
                )
            ]
        , Html.div [ Attr.id "output" ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "OUTPUT" ]
            , Html.div [ Attr.id "output-area" ]
                [ Html.textarea
                    [ Attr.id "console-output"
                    , Attr.value model.output
                    , Events.onInput OutputChange
                    ]
                    []
                ]
            ]
        , Html.div
            [ Attr.id "context"
            , Attr.style "overflow-y" "scroll"
            ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "RESIDUAL" ]
            , Html.table [ Attr.id "hb-table" ]
                (displayResiduals model)
            , displaySelectedStore model
            ]
        , if model.filling then
            displayFillModal model

          else if model.editingInput then
            displayInputModal model

          else
            Html.text ""
        ]


displayHB : HoleBindings -> List (Html Msg)
displayHB hb =
    case hb of
        [] ->
            []

        (hn, store, v) :: rest ->
            Html.tr []
                [ Html.td [ Attr.class "hole-name" ] [ Html.text (printHoleName hn) ]
                , Html.td [] [ Html.text (String.trim (printStore store)) ]
                , Html.td [ Attr.class "hole-value" ] [ Html.text (printValue v) ]
                ]
                :: displayHB rest


displayFillModal : Model -> Html Msg
displayFillModal model =
    Html.div [ Attr.id "fill-modal-bg" ]
        [ Html.div [ Attr.id "fill-modal" ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "FILL HOLES"
                , Html.button
                    [ Attr.class "btn"
                    , Attr.style "width" "70px"
                    , Attr.style "height" "20px"
                    , Attr.style "margin" "2px 8px"
                    , Events.onClick SaveFills
                    ]
                    [ Html.text "Save" ]
                , Html.button
                    [ Attr.class "btn"
                    , Attr.style "width" "70px"
                    , Attr.style "height" "20px"
                    , Events.onClick CancelFill
                    ]
                    [ Html.text "Cancel" ]
                ]
            , Html.table [ Attr.id "hb-table" ]
                (Html.th [ Attr.class "hole-name" ] [ Html.text "" ]
                    :: Html.th [ Attr.class "hole-name" ] [ Html.text "Hole" ]
                    :: Html.th [] [ Html.text "Expression" ]
                    :: List.map (displayFillRow model) model.oriHoles
                )
            ]
        ]


displayInputModal : Model -> Html Msg
displayInputModal model =
    Html.div [ Attr.id "fill-modal-bg" ]
        [ Html.div [ Attr.id "fill-modal" ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "INPUT"
                , Html.button
                    [ Attr.class "btn"
                    , Attr.style "width" "70px"
                    , Attr.style "height" "20px"
                    , Attr.style "margin" "2px 8px"
                    , Events.onClick SaveInput
                    ]
                    [ Html.text "Save" ]
                , Html.button
                    [ Attr.class "btn"
                    , Attr.style "width" "70px"
                    , Attr.style "height" "20px"
                    , Events.onClick CancelInput
                    ]
                    [ Html.text "Cancel" ]
                ]
            , Html.textarea
                [ Attr.style "width" "96%"
                , Attr.style "height" "80%"
                , Attr.style "margin" "8px"
                , Attr.style "font-family" "Verdana"
                , Attr.value model.inputDraft
                , Events.onInput EditInput
                ]
                []
            ]
        ]


displayFillRow : Model -> HoleName -> Html Msg
displayFillRow model hn =
    let
        key =
            exprHoleKey hn
    in
    Html.tr []
        [ Html.td [ Attr.class "hole-name" ]
            [ Html.input
                [ Attr.type_ "checkbox"
                , Attr.checked (Set.member key model.fillSelected)
                , Events.onClick (ToggleFillHole key)
                ]
                []
            ]
        , Html.td [ Attr.class "hole-name" ]
            [ Html.text (printHoleName hn) ]
        , Html.td []
            [ Html.input
                [ Attr.class "context-item"
                , Attr.value (Maybe.withDefault "" (Dict.get key model.fillDraft))
                , Events.onInput (EditFillHole key)
                ]
                []
            ]
        ]


displayResiduals : Model -> List (Html Msg)
displayResiduals model =
    Html.th [ Attr.class "hole-name" ] [ Html.text "Id" ]
        :: Html.th [] [ Html.text "Statement" ]
        :: List.map (displayResidualRow model.currentContext) model.riStmts


displayResidualRow : StmtID -> ( StmtID, Stmt, Store ) -> Html Msg
displayResidualRow selected ( id, stmt, _ ) =
    Html.tr
        [ Attr.style "cursor" "pointer"
        , Attr.style "background-color"
            (if id == selected then
                "#ddeeee"

             else
                "transparent"
            )
        , Events.onClick (SelectResidual id)
        ]
        [ Html.td [ Attr.class "hole-name" ] [ Html.text (String.fromInt id) ]
        , Html.td [] [ Html.text (printStmt stmt) ]
        ]


displaySelectedStore : Model -> Html Msg
displaySelectedStore model =
    if model.currentContext < 0 then
        Html.text ""

    else
        Html.div [ Attr.id "context-area" ]
            [ Html.div [ Attr.class "area-title" ]
                [ Html.text "CONTEXT" ]
            , Html.textarea
                [ Attr.id "console-context"
                , Attr.value model.contextDraft
                , Events.onInput ContextChange
                ]
                []
            ]