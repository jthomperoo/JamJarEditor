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

import path from "path";
import os from "os";
import Workspace from "../data/workspace";
import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";

class WorkspaceWriterLoader {

    private static readonly DEFAULT_WORKSPACE_PATH = path.join(os.homedir(), ".jamjareditor");

    private fileIO: IFileIO;
    private workspacePath: string;

    constructor(fileIO: IFileIO = new FileIO(), workspacePath: string = WorkspaceWriterLoader.DEFAULT_WORKSPACE_PATH) {
        this.fileIO = fileIO;
        this.workspacePath = workspacePath;
    }

    public Write(workspace: Workspace): void {
        this.fileIO.WriteFile(this.workspacePath, JSON.stringify(workspace))
            .catch((err) => {
                throw (`Failed to write workspace file at path ${this.workspacePath}: ${err}`);
            });
    }

    public Load(): Promise<Workspace> {
        return this.fileIO.ReadFile(this.workspacePath)
            .then((data: Buffer) => {
                return Workspace.Unmarshal(JSON.parse(data.toString("utf8")));
            })
            .catch((err) => {
                const code: string | undefined = err["code"];
                if (code === undefined) {
                    throw (err);
                }

                if (code !== "ENOENT") {
                    throw (`Failed to load project file at path ${this.workspacePath}: ${err}`);
                }

                const workspace = new Workspace(undefined);
                this.Write(workspace);
                return workspace;
            });
    }
}

export default WorkspaceWriterLoader;