import { BrowserWindow } from "electron";

interface IEditorServer {
    SetComWindow(comWindow: BrowserWindow): void;
    SyncState(): void;
}

export default IEditorServer;