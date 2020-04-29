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

import { MESSAGE_SYNC_STATE, MESSAGE_READY } from "../../shared/communication/communication";
import { IpcMain, ipcMain, BrowserWindow } from "electron";
import ISceneState from "../../shared/scene_state/iscene_state";
import Scene from "../../shared/data/scene";
import ComponentSpec from "../../shared/data/component_spec";
import IEditorServer from "./ieditor_server";

/**
 * EditorServer handles 'server side/backend' communication for the editor,
 * allowing sending and recieving messages to and from the frontend.
 */
class EditorServer implements IEditorServer {

    private comWindow?: BrowserWindow;
    private ipcMainProcess: IpcMain;
    private sceneState: ISceneState;

    constructor(sceneState: ISceneState, 
        comWindow?: BrowserWindow,
        ipcMainProcess: IpcMain = ipcMain) {
        this.sceneState = sceneState;
        this.comWindow = comWindow;
        this.ipcMainProcess = ipcMainProcess;
        this.ipcMainProcess.addListener(MESSAGE_SYNC_STATE, this.onSyncState.bind(this));
        this.ipcMainProcess.addListener(MESSAGE_READY, this.onReady.bind(this));
    }

    /**
     * Set the current browser window to communicate with
     * @param comWindow Browser window to communicate with
     */
    public SetComWindow(comWindow: BrowserWindow): void {
        this.comWindow = comWindow;
    }

    /**
     * SyncState synchronises state between the frontend and backend by sending
     * a message to the frontend with the backend's state attached. The frontend
     * will override it's own state with the state provided.
     */
    public SyncState(): void {
        if (this.comWindow === undefined) {
            return;
        }
        this.comWindow.webContents.send(MESSAGE_SYNC_STATE, this.sceneState.GetJSON());
    }

    private onReady(event: string | symbol): void {
        // Listener for ready event from frontend
        this.SyncState();
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    private onSyncState(event: string | symbol, syncJSON: any): void {
        // Any allowed here as JSON can be an object of any structure
        // Listener event for a sync request from the frontend
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
    }
}

export default EditorServer;