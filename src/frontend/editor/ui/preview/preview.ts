/*
Copyright 2020 JamJar Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import PreviewGame from "./preview_game";
import MessageBus from "jamjar/lib/message/message_bus";
import UIElement from "../ui_element";
import SceneState from "../../../../shared/scene_state/scene_state";
import SelectedState from "../../selected_state/selected_state";
import SceneControl from "../../scene_control/scene_control";

class Preview extends UIElement {

    private sceneState: SceneState;
    private selectedState: SelectedState;
    private game?: PreviewGame;

    constructor(element: HTMLElement,
        sceneState: SceneState, 
        selectedState: SelectedState, 
        sceneControl: SceneControl,
        doc?: HTMLDocument,
        game?: PreviewGame) {
        super(element, sceneControl, doc);
        this.sceneState = sceneState;
        this.selectedState = selectedState;
        this.game = game;
    }

    public Update(): void {  
        const scene = this.sceneState.GetScene();
        if (scene === undefined) {
            while (this.element.firstChild !== null) {
                this.element.firstChild.remove();
            }
            const newSceneMessage = this.doc.createElement("span");
            newSceneMessage.id = "preview-open-scene-message";
            newSceneMessage.className = "open-scene-message";
            newSceneMessage.innerText = "Create a new Scene or open an existing one to start.";
            this.element.appendChild(newSceneMessage);
            return;
        }
        if (this.game === undefined) {
            while (this.element.firstChild !== null) {
                this.element.firstChild.remove();
            }
            const canvas = this.doc.createElement("canvas");
            canvas.id = "scene-canvas";
            canvas.width = 200;
            canvas.height = 200;
            this.element.appendChild(canvas);

            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.game = new PreviewGame(new MessageBus(), canvas);
            this.game.Start();
            return;
        }
    }
}

export default Preview;