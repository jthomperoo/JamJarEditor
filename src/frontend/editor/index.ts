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

import EditorClient from "./editor_client/editor_client";
import SceneState from "../../shared/scene_state/scene_state";
import SelectedState from "./selected_state/selected_state";
import SceneControl from "./scene_control/scene_control";
import EntitiesList from "./ui/entities_list/entities_list";
import ComponentList from "./ui/component_list/component_list";
import SelectedInspector from "./ui/selected_inspector/selected_inspector";
import Preview from "./ui/preview/preview";

const previewElement = document.getElementById("preview");

if (previewElement === null) {
    throw("Unable to find preview element");
}

const selectedElement = document.getElementById("selected");

if (selectedElement === null) {
    throw("Unable to find selected box element");
}

const entitiesElement = document.getElementById("entities");

if (entitiesElement === null) {
    throw("Unable to find entities box element");
}

const componentElement = document.getElementById("components");

if (componentElement === null) {
    throw("Unable to find component box element");
}

// Set up state
const sceneState = new SceneState();
const selectedState = new SelectedState();

// Set up communications
const editorClient = new EditorClient(sceneState);

// Set up UI
const sceneControl = new SceneControl(editorClient);
sceneControl.SetUIElements([
    new EntitiesList(
        entitiesElement,
        sceneState,
        selectedState,
        sceneControl
    ),
    new ComponentList(
        componentElement,
        sceneState,
        selectedState,
        sceneControl
    ),
    new SelectedInspector(
        selectedElement,
        sceneState,
        selectedState,
        sceneControl
    ),
    new Preview(
        previewElement,
        sceneState,
        selectedState,
        sceneControl
    )
]);

editorClient.SetUpdateables([sceneControl]);
editorClient.Start();