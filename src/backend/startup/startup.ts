import { BrowserWindow, Menu, App, IpcMain, MenuItem, Dialog, app, ipcMain, dialog, OpenDialogReturnValue } from "electron";
import path from "path";
import ProjectManager from "../project/project_manager";
import WorkspaceManager from "../workspace/workspace_manager";
import IProject from "../project/iproject";
import Editor from "../editor/editor";
import IWorkspace from "../workspace/iworkspace";
import Templater from "../templater/templater";
import Messages from "../../shared/messages";

class Startup {

    private static readonly PAGE_PATH = "pages/startup/index.html";
    private static readonly QUIT_MENU_OPTION_LABEL = "Quit";
    private static readonly WINDOW_WIDTH = 400;
    private static readonly WINDOW_HEIGHT = 300;

    private devMode: boolean;
    private devTools: boolean;
    private projectManager: ProjectManager;
    private workspaceManager: WorkspaceManager;
    private templater: Templater;

    private window: BrowserWindow;
    private menu: Menu;
    private application: App;
    private ipcMainProcess: IpcMain;
    private dialogGlobal: Dialog;
    private setApplicationMenu: (menu: Menu | null) => void;

    constructor(
        devMode: boolean,
        devTools: boolean,
        projectManager: ProjectManager,
        workspaceManager: WorkspaceManager,
        templater: Templater,
        window: BrowserWindow = new BrowserWindow({
            title: "JamJar Editor",
            width: Startup.WINDOW_WIDTH,
            height: Startup.WINDOW_HEIGHT,
            show: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path.resolve(__dirname, "../preload.js")
            }
        }),
        menu: Menu = new Menu(),
        application: App = app,
        ipcMainProcess: IpcMain = ipcMain,
        dialogGlobal: Dialog = dialog,
        setApplicationMenu: (menu: Menu | null) => void = Menu.setApplicationMenu) {
        this.devMode = devMode;
        this.devTools = devTools;
        this.workspaceManager = workspaceManager;
        this.projectManager = projectManager;
        this.templater = templater;

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

    public OpenProject(): void {
        this.dialogGlobal.showOpenDialog(this.window, {
            filters: [
                { name: "Package JSON", extensions: ["json"] }
            ]
        }).then((result: OpenDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            if (result.filePaths.length != 1) {
                return;
            }
            this.projectManager.OpenProject(result.filePaths[0])
                .then((project: IProject) => {
                    this.workspaceManager.SaveWorkspace({ lastProjectPath: result.filePaths[0]} as IWorkspace);
                    const editor = new Editor(
                        this.devMode, 
                        this.devTools, 
                        this.projectManager, 
                        this.workspaceManager, 
                        project,
                        this.templater
                    );
                    editor.Start();
                    this.Close();
                });
        });
    }

    public Start(): void {
        this.menu.append(new MenuItem({
            label: Startup.QUIT_MENU_OPTION_LABEL,
            click: this.quit.bind(this)
        }));
        this.setApplicationMenu(this.menu);
        this.window.loadFile(Startup.PAGE_PATH);
        if (this.devMode) {
            this.window.showInactive();
        } else {
            this.window.show();
        }
        if (this.devTools) {
            this.window.webContents.openDevTools();
        }
        this.ipcMainProcess.addListener(Messages.OPEN_PROJECT, this.OpenProject.bind(this));
    }

    public Close(): void {
        this.window.close();
    }
}

export default Startup;