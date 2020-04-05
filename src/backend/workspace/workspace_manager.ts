import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";
import path from "path";
import os from "os";
import IWorkspace from "../workspace/iworkspace";

class WorkspaceManager {

    private static readonly DEFAULT_WORKSPACE_PATH = path.join(os.homedir(), ".jamjareditor");

    private fileIO: IFileIO;
    private workspacePath: string;

    constructor(fileIO: IFileIO = new FileIO(), workspacePath: string = WorkspaceManager.DEFAULT_WORKSPACE_PATH) {
        this.fileIO = fileIO;
        this.workspacePath = workspacePath;
    }

    public SaveWorkspace(workspace: IWorkspace): void {
        this.fileIO.WriteFile(this.workspacePath, JSON.stringify(workspace), { encoding: "utf8" })
            .catch((err) => {
                throw (`Failed to write workspace file at path ${this.workspacePath}: ${err}`);
            });
    }

    public LoadWorkspace(): Promise<IWorkspace> {
        return this.fileIO.ReadFile(this.workspacePath, undefined)
            .then((data: Buffer) => {
                return JSON.parse(data.toString("utf8")) as IWorkspace;
            })
            .catch((err) => {
                const code: string | undefined = err["code"];
                if (code === undefined) {
                    throw (err);
                }

                if (code !== "ENOENT") {
                    throw (`Failed to load project file at path ${this.workspacePath}: ${err}`);
                }

                const workspace = {
                    lastProjectPath: undefined
                } as IWorkspace;

                this.SaveWorkspace(workspace);
                return workspace;
            });
    }
}

export default WorkspaceManager;