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

import SceneControl from "../scene_control/scene_control";
import IUpdateable from "./iupdateable";

abstract class UIElement implements IUpdateable {
    protected element: HTMLElement;
    protected sceneControl: SceneControl;
    protected doc: HTMLDocument;

    constructor(element: HTMLElement, sceneControl: SceneControl, doc: HTMLDocument = document) {
        this.element = element;
        this.sceneControl = sceneControl;
        this.doc = doc;
    }

    public Update(): void {
        return;
    }
}

export default UIElement;