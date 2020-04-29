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
import { MESSAGE_SYNC_STATE, MESSAGE_READY } from "../../../shared/communication/communication";
import IUpdateable from "../ui/iupdateable";
import ISceneState from "../../../shared/scene_state/iscene_state";
import ComponentSpec from "../../../shared/data/component_spec";
import Scene from "../../../shared/data/scene";

/**
 * EditorClient handles 'client side/frontend' communication for the editor,
 * allowing sending and recieving messages to and from the backend. 
 */
class EditorClient {

    private updateables: IUpdateable[];
    private ipcRendererProcess: Electron.IpcRenderer;
    private sceneState: ISceneState;

    constructor(sceneState: ISceneState, 
        ipcRendererProcess: Electron.IpcRenderer = window.ipcRenderer, 
        updateables: IUpdateable[] = []) {
        this.sceneState = sceneState;
        this.ipcRendererProcess = ipcRendererProcess;
        this.updateables = updateables;
        this.ipcRendererProcess.addListener(MESSAGE_SYNC_STATE, this.onSyncState.bind(this));
    }

    /**
     * SetUpdateables sets the UI elements/control that should be updated on a
     * state sync.
     * @param updateables List of objects to update on a state sync
     */
    public SetUpdateables(updateables: IUpdateable[]): void {
        this.updateables = updateables;
    }

    public Start(): void {
        this.ipcRendererProcess.send(MESSAGE_READY);
    }

    /**
     * SyncState synchronises state between the frontend and backend by sending
     * a message to the backend with the frontend's state attached. The backend
     * will override it's own state with the state provided.
     */
    public SyncState(): void {
        this.ipcRendererProcess.send(MESSAGE_SYNC_STATE, this.sceneState.GetJSON());
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public onSyncState(event: string | symbol, syncJSON: any): void {
        // Any allowed here as JSON can be an object of any structure
        // Listener event for a sync request from the backend
        const specs: ComponentSpec[] = [];
        for (const specJSON of syncJSON["specs"]) {
            specs.push(ComponentSpec.Unmarshal(specJSON));
        }
        this.sceneState.SetSpecs(specs);

        if (syncJSON["scene"] === undefined) {
            this.sceneState.SetScene(undefined);
        } else {
            const scene = Scene.Unmarshal(syncJSON["scene"]);
            this.sceneState.SetScene(scene);
        }

        for (const updateable of this.updateables) {
            updateable.Update();
        }
    }
}

export default EditorClient;