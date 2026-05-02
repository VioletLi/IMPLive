module Ui.View exposing (..)

import Html exposing (..)
import Html.Events as Events
import Html.Attributes as Attr
import Ui.Model exposing (Msg(..), Model)
import Ui.Model exposing (Mode(..))
import LangUtils.GUI exposing (..)


view : Model -> Html Msg
view model = 
    let
        runDisplayStr = 
            if model.mode == RUNNING then "" else "none"

        editDisplayStr = 
            if model.mode == EDITING then "" else "none"

        isEdit = 
            model.mode == EDITING
    in
        div
            [ Attr.id "lazy-bi-eval" ]
            [ div
                [ Attr.id "menu-bar" ]
                [ div
                    [ Attr.id "title" ]
                    [ text "Bi-DynDev" ]
                , select [ Events.onInput SelectPreEx
                        , Attr.style "width" "100px"
                        , Attr.class "btn"]
                        <| List.map (\s-> option [Attr.value s] [text s]) 
                        <| model.preExs
                , button
                    [ Attr.class "btn fwd"
                    , Attr.id "run-program"
                    ]
                    [ text "Run" ]

                , div 
                    [ Attr.class "text-block"]
                    [ span
                        [ Attr.id "mode-prompt" ] 
                        [ text "Mode: " ]
                    , span
                        [ Attr.id "mode"] 
                        [ text (modeToStr model.mode) ]
                    ]
                , button 
                    [ Attr.class "btn"
                    , Attr.style "display" runDisplayStr 
                    , Events.onClick (ChangeMode EDITING)
                    ]
                    [ text "To Edit" ]    

                , button 
                    [ Attr.class "btn"
                    , Attr.id "run"
                    , Attr.style "display" editDisplayStr 
                    , Events.onClick (ChangeMode RUNNING) 
                    ]
                    [ text "To Run" ]
                , button 
                    [ Attr.class "btn"
                    , Attr.id "revert-delta"
                    , Events.onClick (ChangeEventIndex "0")
                    , Attr.style "display" editDisplayStr 
                    ]
                    [ text "Revert" ]
                , button
                    [ Attr.class "btn"
                    , Attr.id "save-delta"
                    , Events.onClick Backward
                    , Events.onMouseOver BackwardPreview
                    , Events.onMouseOut BackwardPreviewRevert
                    , Attr.style "display" editDisplayStr
                    ]
                    [ text "Update Source" ]
                , select 
                    [ Events.onInput ChangeEventIndex
                    , Attr.class "btn"
                    , Attr.style "width" "125px"
                    , Attr.style "display" editDisplayStr
                    ]
                    <| makeSelectListForEvents model.eventIndex model.triggeredEvents
                ]
            , div
                [ Attr.id "code-block" ]
                [ div
                    [ Attr.class "area-title" ]
                    [ text "Code Block" ]
                ]
            , div
                [ Attr.id "output-block" ]
                [ div
                    [ Attr.class "area-title" ]
                    [ Html.text "GUI Output" ]
                , div
                    [ Attr.id "output-area" 
                    , Attr.attribute "mode" (modeToStr model.mode) 
                    ]
                    []
                ]
            -- , div
            --     [ Attr.id "delta-block" ]
            --     [ div
            --         [ Attr.class "area-title" ]
            --         [ text "Delta Block" ]
            --     , textarea
            --         [ Attr.id "delta-textarea"
            --         , Events.onInput SetDelta
            --         , Attr.style "resize" "none"
            --         , Attr.disabled (not isEdit)
            --         ]
            --         [ text "id" ]
            --     ]
            ]


modeToStr : Mode -> String
modeToStr mode =
    case mode of
        NotStart -> "Not Start"
        RUNNING  -> "Running"
        EDITING  -> "Editing"