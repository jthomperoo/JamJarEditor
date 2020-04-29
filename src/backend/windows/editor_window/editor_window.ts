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

import { BrowserWindow, Menu, App, Dialog, MenuItem, dialog, app, OpenDialogReturnValue, SaveDialogReturnValue } from "electron";
import path from "path";
import Scene from "../../../shared/data/scene";
import Entity from "../../../shared/data/entity";
import IComponentSpecLoader from "../../component_spec_loader/icomponent_spec_loader";
import IProjectWriterLoader from "../../project_writer_loader/iproject_writer_loader";
import IWorkspaceWriterLoader from "../../workspace_writer_loader/iworkspace_writer_loader";
import IProjectState from "../../data/project_state/iproject_state";
import ISceneState from "../../../shared/scene_state/iscene_state";
import ISceneWriter from "../../scene_writer/iscene_writer";
import IEditorServer from "../../editor_server/ieditor_server";
import Project from "../../data/project";
import Workspace from "../../data/workspace";
import ComponentSpec from "../../../shared/data/component_spec";
import ISceneTemplater from "../../scene_templater/iscene_templater";

class EditorWindow {

    private static readonly MENU_FILE = "File";
    private static readonly MENU_FILE_OPEN_PROJECT = "Open Project";
    private static readonly MENU_FILE_NEW_SCENE = "New Scene";
    private static readonly MENU_FILE_OPEN_SCENE = "Open Scene";
    private static readonly MENU_FILE_SAVE_SCENE = "Save Scene";
    private static readonly MENU_FILE_QUIT = "Quit";

    private static readonly MENU_ENTITY = "Entity";
    private static readonly MENU_ENTITY_NEW = "New";

    private static readonly MENU_COMPONENT = "Component";
    private static readonly MENU_COMPONENT_IMPORT = "Import";


    private static readonly PAGE_PATH = "pages/editor/index.html";
    private static readonly WINDOW_WIDTH = 800;
    private static readonly WINDOW_HEIGHT = 600;

    private devMode: boolean;
    private devTools: boolean;

    private projectState: IProjectState;
    private sceneState: ISceneState;

    private projectWriterLoader: IProjectWriterLoader;
    private workspaceWriterLoader: IWorkspaceWriterLoader;
    private componentSpecLoader: IComponentSpecLoader;
    private sceneWriter: ISceneWriter;
    private sceneTemplater: ISceneTemplater;

    private editorServer: IEditorServer;

    private window: BrowserWindow;
    private menu: Menu;
    private application: App;
    private dialogGlobal: Dialog;
    private setApplicationMenu: (menu: Menu | null) => void;

    constructor(
        devMode: boolean,
        devTools: boolean,
        projectState: IProjectState,
        sceneState: ISceneState,
        projectWriterLoader: IProjectWriterLoader,
        workspaceWriterLoader: IWorkspaceWriterLoader,
        componentSpecLoader: IComponentSpecLoader,
        sceneWriter: ISceneWriter,
        sceneTemplater: ISceneTemplater,
        editorServer: IEditorServer,
        window: BrowserWindow = new BrowserWindow({
            title: "JamJar Editor",
            width: EditorWindow.WINDOW_WIDTH,
            height: EditorWindow.WINDOW_HEIGHT,
            show: false,
            resizable: true,
            webPreferences: {
                nodeIntegration: false,
                webgl: true,
                preload: path.resolve(__dirname, "../../preload.js")
            },
        }),
        menu: Menu = new Menu(),
        application: App = app,
        dialogGlobal: Dialog = dialog,
        setApplicationMenu: (menu: Menu | null) => void = Menu.setApplicationMenu) {
        this.devMode = devMode;
        this.devTools = devTools;

        this.projectState = projectState;
        this.sceneState = sceneState;

        this.projectWriterLoader = projectWriterLoader;
        this.workspaceWriterLoader = workspaceWriterLoader;
        this.componentSpecLoader = componentSpecLoader;
        this.sceneWriter = sceneWriter;
        this.sceneTemplater = sceneTemplater;

        this.editorServer = editorServer;

        this.window = window;
        this.menu = menu;
        this.application = application;
        this.dialogGlobal = dialogGlobal;
        this.setApplicationMenu = setApplicationMenu;
    }

    private quit(): void {
        this.window.close();
        this.application.quit();
    }

    private openProject(): void {
        this.dialogGlobal.showOpenDialog(this.window, {
            filters: [
                { name: "Package JSON", extensions: ["json"] }
            ]
        }).then((result: OpenDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            if (result.filePaths.length !== 1) {
                return;
            }
            const projectFilePath = result.filePaths[0];
            this.projectWriterLoader.Load(projectFilePath)
                .then((project: Project) => {
                    this.workspaceWriterLoader.Load()
                        .then((workspace: Workspace) => {
                            workspace.lastProjectPath = projectFilePath;
                            this.workspaceWriterLoader.Write(workspace);
                        });
                        const specs: ComponentSpec[] = [];
                        for (const specPath of project.specs) {
                            const componentSpec = this.componentSpecLoader.Load(specPath);
                            specs.push(componentSpec);
                        }
                        if (project.lastScenePath === undefined) {
                            // No loaded scene
                            this.sceneState.SetScene(undefined);
                            this.sceneState.SetSpecs(specs);
                            this.editorServer.SyncState();
                            return;
                        }
                        // TODO: ADD SCENE LOADING
                        this.sceneState.SetScene(undefined);
                        this.sceneState.SetSpecs(specs);
                        this.editorServer.SyncState();
                });
        });
    }

    private newScene(): void {
        const project = this.projectState.GetProject();
        let dialogStartFilePath: string | undefined = undefined;
        if (project !== undefined) {
            dialogStartFilePath = path.dirname(project.path);
        }
        this.dialogGlobal.showSaveDialog(this.window, {
            filters: [
                { name: "Scene TypeScript files", extensions: ["ts"] }
            ],
            defaultPath: dialogStartFilePath
        }).then((result: SaveDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            if (result.filePath === undefined) {
                return;
            }
            let filePath = result.filePath;
            if (path.extname(filePath) === "") {
                filePath = `${filePath}.ts`;
            }
            // Save new templated scene file
            this.sceneTemplater.Template(result.filePath);
            this.sceneState.SetScene(new Scene(filePath, []));
            this.editorServer.SyncState();
            this.window.setTitle(`JamJar Editor - ${filePath}`);
            // Update project
            if (project !== undefined) {
                project.path = filePath;
                this.projectState.SetProject(project);
                this.projectWriterLoader.Write(project);
            }
        });
    }

    private openScene(): void {
        console.log("STUB");
    }

    private saveScene(): void {
        const scene = this.sceneState.GetScene();
        const specs = this.sceneState.GetSpecs();
        if (scene === undefined) {
            return;
        }
        this.sceneWriter.Write(scene.path, scene, specs);
    }

    private newEntity(): void {
        const scene = this.sceneState.GetScene();
        if (scene === undefined) {
            return;
        }
        scene.entities.push(new Entity("test", []));
        this.sceneState.SetScene(scene);
        this.editorServer.SyncState();
    }

    private importComponent(): void {
        const project = this.projectState.GetProject();
        let dialogStartFilePath: string | undefined = undefined;
        if (project !== undefined) {
            dialogStartFilePath = path.dirname(project.path);
        }
        this.dialogGlobal.showOpenDialog(this.window, {
            filters: [
                { name: "Component TypeScript files", extensions: ["ts"] }
            ],
            defaultPath: dialogStartFilePath
        }).then((result: OpenDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            const specs: ComponentSpec[] = this.sceneState.GetSpecs();
            for (const specPath of result.filePaths) {
                const componentSpec = this.componentSpecLoader.Load(specPath);
                specs.push(componentSpec);
                if (project !== undefined) {
                    project.specs.push(specPath);
                }
            }
            this.sceneState.SetSpecs(specs);
            this.editorServer.SyncState();
        });
    }

    public Start(): void {
        const project = this.projectState.GetProject();
        if (project !== undefined) {
            const specs: ComponentSpec[] = [];
            for (const specPath of project.specs) {
                const componentSpec = this.componentSpecLoader.Load(specPath);
                specs.push(componentSpec);
            }
            if (project.lastScenePath === undefined) {
                // No loaded scene
                this.sceneState.SetScene(undefined);
                this.sceneState.SetSpecs(specs);
                this.editorServer.SyncState();
                return;
            }
            // TODO: ADD SCENE LOADING
            this.sceneState.SetScene(undefined);
            this.sceneState.SetSpecs(specs);
        }
        const appMenuItems = this.createAppMenuItems();
        for (const appMenuItem of appMenuItems) {
            this.menu.append(appMenuItem);
        }
        this.setApplicationMenu(this.menu);
        this.window.loadFile(EditorWindow.PAGE_PATH);
        this.editorServer.SetComWindow(this.window);
        if (this.devMode) {
            this.window.showInactive();
        } else {
            this.window.maximize();
        }
        if (this.devTools) {
            this.window.webContents.openDevTools();
        }
    }

    public Close(): void {
        this.window.close();
    }

    private createAppMenuItems(): MenuItem[] {
        return [
            new MenuItem({
                label: EditorWindow.MENU_FILE,
                submenu: [
                    {
                        label: EditorWindow.MENU_FILE_OPEN_PROJECT,
                        click: this.openProject.bind(this)
                    },
                    {
                        label: EditorWindow.MENU_FILE_NEW_SCENE,
                        click: this.newScene.bind(this)
                    },
                    {
                        label: EditorWindow.MENU_FILE_OPEN_SCENE,
                        click: this.openScene.bind(this)
                    },
                    {
                        label: EditorWindow.MENU_FILE_SAVE_SCENE,
                        click: this.saveScene.bind(this)
                    },
                    {
                        label: EditorWindow.MENU_FILE_QUIT,
                        click: this.quit.bind(this)
                    }
                ]
            }),
            new MenuItem({
                label: EditorWindow.MENU_ENTITY,
                submenu: [
                    {
                        label: EditorWindow.MENU_ENTITY_NEW,
                        click: this.newEntity.bind(this)
                    },
                ]
            }),
            new MenuItem({
                label: EditorWindow.MENU_COMPONENT,
                submenu: [
                    {
                        label: EditorWindow.MENU_COMPONENT_IMPORT,
                        click: this.importComponent.bind(this)
                    },
                ]
            }),
        ];
    }
}

export default EditorWindow;