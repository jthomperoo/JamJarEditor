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

import IProjectState from "./iproject_state";
import Project from "../project";
import Workspace from "../workspace";

class ProjectState implements IProjectState {
    private workspace?: Workspace;
    private project?: Project;
    constructor(workspace?: Workspace, project?: Project) {
        this.workspace = workspace;
        this.project = project;
    }

    public GetWorkspace(): Workspace | undefined {
        if (this.workspace === undefined) {
            return undefined;
        }
        return this.workspace.Copy();
    }

    public SetWorkspace(update: Workspace): void {
        this.workspace = update.Copy();
    }

    public GetProject(): Project | undefined {
        if (this.project === undefined) {
            return undefined;
        }
        return this.project.Copy();
    }

    public SetProject(update: Project): void {
        this.project = update.Copy();
    }
}

export default ProjectState;