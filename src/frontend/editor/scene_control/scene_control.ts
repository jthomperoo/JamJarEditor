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

import UIElement from "../ui/ui_element";
import IUpdateable from "../ui/iupdateable";
import EditorClient from "../editor_client/editor_client";

/**
 * SceneControl coordinates the UI by triggering updates, requesting that
 * frontend changes are synced to the backend's state.
 */
class SceneControl implements IUpdateable {
    private editorClient: EditorClient;
    private uiElements: UIElement[];

    constructor(editorClient: EditorClient,uiElements: UIElement[] = []) {
        this.editorClient = editorClient;
        this.uiElements = uiElements;
    }

    /**
     * SetUIElements sets the UI elements for the scene control to update.
     * @param uiElements The list of UI elements to update on sync
     */
    public SetUIElements(uiElements: UIElement[]): void {
        this.uiElements = uiElements;
    }

    /**
     * Update is used to update all UI elements controlled by the scene control,
     * while also syncing frontend state with backend state.
     */
    public Update(): void {
        this.editorClient.SyncState();
        for (const uiElement of this.uiElements) {
            uiElement.Update();
        }
    }
    
}

export default SceneControl;