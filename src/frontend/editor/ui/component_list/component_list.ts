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

class ComponentList extends UIElement {

    private sceneState: SceneState;
    private selectedState: SelectedState;

    constructor(element: HTMLElement,
        sceneState: SceneState, 
        selectedState: SelectedState, 
        sceneControl: SceneControl,
        doc?: HTMLDocument) {
        super(element, sceneControl, doc);
        this.sceneState = sceneState;
        this.selectedState = selectedState;
    }

    public Update(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }

        const componentListTitle = this.doc.createElement("h2");
        componentListTitle.innerText = "Components";
        componentListTitle.id = "component-list-title";
        componentListTitle.className = "ui-box-title";
        this.element.appendChild(componentListTitle);

        const componentList = this.doc.createElement("ul");
        componentList.id = "component-list";
        componentList.className = "item-list";

        const specs = this.sceneState.GetSpecs();

        for (const spec of specs) {
            // Component Box
            const componentBox = this.doc.createElement("li");
            componentBox.className = "component-item";

            // Component Name
            const componentName = this.doc.createElement("a");
            componentName.href = "#";
            componentName.className = "component-name";
            componentName.innerText = spec.name;
            componentName.onclick = (): void => {
                const scene = this.sceneState.GetScene();
                if (scene === undefined) {
                    return;
                }

                const selected = this.selectedState.GetSelected();
                if (selected === undefined) {
                    return;
                }

                for(const entity of scene.entities) {
                    if (entity.id !== selected.id) {
                        continue;
                    }
                    entity.components.push(spec.GenerateComponent());
                    this.selectedState.SetSelected(entity);
                }
                this.sceneState.SetScene(scene);
                this.sceneControl.Update();
            };
            componentBox.appendChild(componentName);
            componentList.appendChild(componentBox);
        }
        this.element.appendChild(componentList);
    }
}

export default ComponentList;