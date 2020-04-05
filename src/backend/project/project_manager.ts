import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";
import path from "path";
import IProject from "./iproject";

class ProjectManager {

    private fileIO: IFileIO;

    constructor(fileIO: IFileIO = new FileIO()) {
        this.fileIO = fileIO;
    }

    public SaveProject(projectPath: string, project: IProject): void {
        const jamjarProjectPath = path.join(path.dirname(projectPath), ".jamjarproject");
        this.fileIO.WriteFile(jamjarProjectPath, JSON.stringify(project), { encoding: "utf8" })
            .catch((err) => {
                throw (`Failed to write project file at path ${jamjarProjectPath}: ${err}`);
            });
    }

    public OpenProject(projectPath: string): Promise<IProject> {
        const jamjarProjectPath = path.join(path.dirname(projectPath), ".jamjarproject");
        return this.fileIO.ReadFile(jamjarProjectPath, undefined)
            .then((data: Buffer) => {
                return JSON.parse(data.toString("utf8")) as IProject;
            })
            .catch((err) => {
                const code: string | undefined = err["code"];
                if (code === undefined) {
                    throw (err);
                }

                if (code !== "ENOENT") {
                    throw (`Failed to load project file at path ${jamjarProjectPath}: ${err}`);
                }

                const project = {
                    lastScenePath: undefined,
                    path: projectPath,
                    specs: []
                } as IProject;

                this.SaveProject(jamjarProjectPath, project);
                return project;
            });
    }
}

export default ProjectManager;