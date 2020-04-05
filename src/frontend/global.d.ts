import { IpcRenderer } from "electron";
export {};

declare global {
    interface Window {
        ipcRenderer: IpcRenderer;
        IpcRenderer: any;
        IpcRendererEvent: any;
    }
}