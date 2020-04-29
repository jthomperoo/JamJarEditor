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

import { app } from "electron";
import handlebars from "handlebars";
import Startup from "./windows/startup_window/startup_window";
import FileIO from "./file_io/file_io";
import WorkspaceWriterLoader from "./workspace_writer_loader/workspace_writer_loader";
import ProjectWriterLoader from "./project_writer_loader/project_writer_loader";
import ComponentSpecLoader from "./component_spec_loader/component_spec_loader";
import SceneWriter from "./scene_writer/scene_writer";
import SceneTemplater from "./scene_templater/scene_templater";
import EditorServer from "./editor_server/editor_server";
import SceneState from "../shared/scene_state/scene_state";
import EditorWindow from "./windows/editor_window/editor_window";
import ProjectState from "./data/project_state/project_state";

app.allowRendererProcessReuse = false;

const TEMPLATE_PATH = "templates/scene.template";

function main(): void {
    const devModeEnv = process.env.DEV_MODE;
    const devToolsEnv = process.env.DEV_TOOLS;

    let devMode = false;
    if (devModeEnv !== undefined) {
        if (devModeEnv === "true") {
            devMode = true;
        }
    }

    let devTools = false;
    if (devToolsEnv !== undefined) {
        if (devToolsEnv === "true") {
            devTools = true;
        }
    }

    const fileIO = new FileIO();

    const sceneState = new SceneState();
    const projectState = new ProjectState();

    const workspaceWriterLoader = new WorkspaceWriterLoader();
    const projectWriterLoader = new ProjectWriterLoader();
    const componentSpecLoader = new ComponentSpecLoader();
    const sceneWriter = new SceneWriter();
    const editorServer = new EditorServer(sceneState);

    fileIO.ReadFile(TEMPLATE_PATH)
        .then((data) => {
            const sceneTemplater = new SceneTemplater(handlebars.compile(data.toString("utf8")));
            workspaceWriterLoader.Load()
                .then((workspace) => {
                    projectState.SetWorkspace(workspace);
                    if (workspace.lastProjectPath === undefined) {
                        // No project to open
                        new Startup(
                            devMode, 
                            devTools,
                            projectState,
                            sceneState,
                            projectWriterLoader,
                            workspaceWriterLoader,
                            componentSpecLoader,
                            sceneWriter,
                            sceneTemplater,
                            editorServer
                        ).Start();
                    } else {
                        projectWriterLoader.Load(workspace.lastProjectPath)
                            .then((project) => {
                                projectState.SetProject(project);
                                // Open existing
                                new EditorWindow(
                                    devMode, 
                                    devTools,
                                    projectState,
                                    sceneState,
                                    projectWriterLoader,
                                    workspaceWriterLoader,
                                    componentSpecLoader,
                                    sceneWriter,
                                    sceneTemplater,
                                    editorServer
                                ).Start();
                            });
                    }
                });
        });
}

app.whenReady().then(main);