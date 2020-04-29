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

import UIElement from "../ui_element";
import SceneControl from "../../scene_control/scene_control";
import SceneState from "../../../../shared/scene_state/scene_state";
import SelectedState from "../../selected_state/selected_state";

class EntitiesList extends UIElement {

    private sceneState: SceneState;
    private selectedState: SelectedState;

    constructor(element: HTMLElement, sceneState: SceneState, selectedState: SelectedState, sceneControl: SceneControl, doc?: HTMLDocument) {
        super(element, sceneControl, doc);
        this.sceneState = sceneState;
        this.selectedState = selectedState;
    }

    public Update(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }

        const entityListTitle = this.doc.createElement("h2");
        entityListTitle.innerText = "Entities";
        entityListTitle.id = "entity-list-title";
        entityListTitle.className = "ui-box-title";
        this.element.appendChild(entityListTitle);

        const entityList = this.doc.createElement("ul");
        entityList.id = "entity-list";
        entityList.className = "item-list";

        const scene = this.sceneState.GetScene();
        if (scene === undefined) {
            return;
        }
        const entities = scene.entities;

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const entityItem = this.doc.createElement("li");
            entityItem.className = "entity-item";
            const entityButton = this.doc.createElement("a");
            entityButton.href = "#";
            entityButton.innerText = entity.name;
            entityButton.onclick = (): void => {
                this.selectedState.SetSelected(entity);
                this.sceneControl.Update();
            };
            entityItem.appendChild(entityButton);
            const entityDeleteButton = this.doc.createElement("button");
            entityDeleteButton.innerText = "Delete";
            entityDeleteButton.onclick = (): void => {
                entities.splice(i, 1);
                this.sceneState.SetScene(scene);
                this.sceneControl.Update();
            };
            entityItem.appendChild(entityDeleteButton);
            entityList.appendChild(entityItem);
        }

        this.element.appendChild(entityList);
    }
}

export default EntitiesList;