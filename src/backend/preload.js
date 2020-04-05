import { ipcRenderer, IpcRenderer, IpcRendererEvent } from "electron";
window.ipcRenderer = ipcRenderer;
window.IpcRenderer = IpcRenderer
window.IpcRendererEvent = IpcRendererEvent;