import { app } from "electron";
import { compile } from "handlebars";
import Startup from "./startup/startup";
import Editor from "./editor/editor";
import IWorkspace from "./workspace/iworkspace";
import IProject from "./project/iproject";
import WorkspaceManager from "./workspace/workspace_manager";
import ProjectManager from "./project/project_manager";
import FileIO from "./file_io/file_io";
import Templater from "./templater/templater";

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

    fileIO.ReadFile(TEMPLATE_PATH, {})
        .then((data) => {
            const template = compile(data.toString("utf8"));
            const templater = new Templater(template);
            const projectManager = new ProjectManager();
            const workspaceManager = new WorkspaceManager();
            workspaceManager.LoadWorkspace()
                .then((workspace: IWorkspace) => {
                    if (workspace.lastProjectPath === undefined) {
                        // No previously loaded project
                        const startup = new Startup(devMode, devTools, projectManager, workspaceManager, templater);
                        startup.Start();
                        return;
                    }

                    // Previously opened, open that project
                    projectManager.OpenProject(workspace.lastProjectPath)
                        .then((project: IProject) => {
                            const editor = new Editor(devMode, devTools, projectManager, workspaceManager, project, templater)
                            editor.Start();
                        });
                })
        });
}

app.whenReady().then(main);