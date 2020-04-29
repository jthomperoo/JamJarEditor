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

import { BrowserWindow, Menu, App, IpcMain, MenuItem, Dialog, app, ipcMain, dialog, OpenDialogReturnValue } from "electron";
import { MESSAGE_OPEN_PROJECT } from "../../../shared/communication/communication";
import path from "path";
import Editor from "../editor_window/editor_window";
import IProjectState from "../../data/project_state/iproject_state";
import ISceneState from "../../../shared/scene_state/iscene_state";
import IProjectWriterLoader from "../../project_writer_loader/iproject_writer_loader";
import IWorkspaceWriterLoader from "../../workspace_writer_loader/iworkspace_writer_loader";
import IComponentSpecLoader from "../../component_spec_loader/icomponent_spec_loader";
import ISceneWriter from "../../scene_writer/iscene_writer";
import ISceneTemplater from "../../scene_templater/iscene_templater";
import IEditorServer from "../../editor_server/ieditor_server";
import Project from "../../data/project";
import Workspace from "../../data/workspace";

class StartupWindow {

    private static readonly PAGE_PATH = "pages/startup/index.html";
    private static readonly QUIT_MENU_OPTION_LABEL = "Quit";
    private static readonly WINDOW_WIDTH = 400;
    private static readonly WINDOW_HEIGHT = 300;

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
    private ipcMainProcess: IpcMain;
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
            width: StartupWindow.WINDOW_WIDTH,
            height: StartupWindow.WINDOW_HEIGHT,
            show: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path.resolve(__dirname, "../../preload.js")
            }
        }),
        menu: Menu = new Menu(),
        application: App = app,
        ipcMainProcess: IpcMain = ipcMain,
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
        this.ipcMainProcess = ipcMainProcess;
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
                    this.projectState.SetProject(project);
                    this.projectWriterLoader.Write(project);
                    this.workspaceWriterLoader.Load()
                        .then((workspace: Workspace) => {
                            workspace.lastProjectPath = projectFilePath;
                            this.projectState.SetWorkspace(workspace);
                            this.workspaceWriterLoader.Write(workspace);
                        });
                    new Editor(
                        this.devMode,
                        this.devTools,
                        this.projectState,
                        this.sceneState,
                        this.projectWriterLoader,
                        this.workspaceWriterLoader,
                        this.componentSpecLoader,
                        this.sceneWriter,
                        this.sceneTemplater,
                        this.editorServer
                    ).Start();
                    this.Close();
                });
        });
    }

    public Start(): void {
        this.menu.append(new MenuItem({
            label: StartupWindow.QUIT_MENU_OPTION_LABEL,
            click: this.quit.bind(this)
        }));
        this.setApplicationMenu(this.menu);
        this.window.loadFile(StartupWindow.PAGE_PATH);
        if (this.devMode) {
            this.window.showInactive();
        } else {
            this.window.show();
        }
        if (this.devTools) {
            this.window.webContents.openDevTools();
        }
        this.ipcMainProcess.addListener(MESSAGE_OPEN_PROJECT, this.openProject.bind(this));
    }

    public Close(): void {
        this.window.close();
    }
}

export default StartupWindow;