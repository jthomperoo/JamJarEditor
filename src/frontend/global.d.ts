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

import { IpcRenderer } from "electron";
export {};

declare global {
    // Redefining global Window to include IPC Renderer types
    /* eslint-disable  @typescript-eslint/interface-name-prefix */
    interface Window {
        ipcRenderer: IpcRenderer;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        IpcRenderer: any;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        IpcRendererEvent: any;
    }
}