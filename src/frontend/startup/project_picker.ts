import Messages from "../../shared/messages";

class ProjectPicker {
    private ipcRendererProcess: any;
    constructor(ipcRendererProcess: any = window.ipcRenderer) {
        this.ipcRendererProcess = ipcRendererProcess;
    }

    public OpenProject(): void {
        this.ipcRendererProcess.send(Messages.OPEN_PROJECT);
    }
}

export default ProjectPicker;