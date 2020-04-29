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

import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";
import path from "path";
import Project from "../data/project";
import IProjectWriterLoader from "./iproject_writer_loader";

/**
 * ProjectWriterLoader allows writing and loading projects to and from disk.
 */
class ProjectWriterLoader implements IProjectWriterLoader {

    private fileIO: IFileIO;

    constructor(fileIO: IFileIO = new FileIO()) {
        this.fileIO = fileIO;
    }

    /**
     * Load reads a project from disk and parses it.
     * @param projectPath The filepath of the project to read
     */
    public Load(projectPath: string): Promise<Project> {
        const jamjarProjectPath = path.join(path.dirname(projectPath), ".jamjarproject");
        return this.fileIO.ReadFile(jamjarProjectPath)
            .then((data: Buffer) => {
                return Project.Unmarshal(JSON.parse(data.toString("utf8")));
            })
            .catch((err) => {
                const code: string | undefined = err["code"];
                if (code === undefined) {
                    throw (err);
                }

                if (code !== "ENOENT") {
                    throw (`Failed to load project file at path ${jamjarProjectPath}: ${err}`);
                }

                const project = new Project(undefined, projectPath, []);
                this.Write(project);
                return project;
            });
    }

    /**
     * Write converts a provided project to JSON and writes it to disk.
     * @param project The project to write
     */
    public Write(project: Project): void {
        const jamjarProjectPath = path.join(path.dirname(project.path), ".jamjarproject");
        this.fileIO.WriteFile(jamjarProjectPath, JSON.stringify(project))
            .catch((err) => {
                throw (`Failed to write project file at path ${jamjarProjectPath}: ${err}`);
            });
    }

}

export default ProjectWriterLoader;