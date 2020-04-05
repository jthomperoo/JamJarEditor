import { BrowserWindow, Menu, App, IpcMain, Dialog, MenuItem, dialog, app, ipcMain, OpenDialogReturnValue, SaveDialogReturnValue } from "electron";
import path from "path";
import IProject from "../project/iproject";
import Scene from "../../shared/scene";
import IFileIO from "../file_io/ifile_io";
import FileIO from "../file_io/file_io";
import ProjectManager from "../project/project_manager";
import WorkspaceManager from "../workspace/workspace_manager";
import IWorkspace from "../workspace/iworkspace";
import ComponentSpec from "../../shared/component_spec";
import Entity from "../../shared/entity";
import Templater from "../templater/templater";
import Compiler from "../compiler/compiler";
import ComponentParser from "../parser/component_parser";
import Messages from "../../shared/messages";

class Editor {

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
    private projectManager: ProjectManager;
    private workspaceManager: WorkspaceManager;
    private project: IProject;
    private templater: Templater;
    private compiler?: Compiler;

    private componentParser: ComponentParser;
    private scene?: Scene;
    private specs: ComponentSpec[];
    private window: BrowserWindow;
    private menu: Menu;
    private fileIO: IFileIO;
    private application: App;
    private ipcMainProcess: IpcMain;
    private dialogGlobal: Dialog;
    private setApplicationMenu: (menu: Menu | null) => void;

    constructor(
        devMode: boolean,
        devTools: boolean,
        projectManager: ProjectManager,
        workspaceManager: WorkspaceManager,
        project: IProject,
        templater: Templater,
        compiler?: Compiler,
        scene?: Scene,
        componentParser: ComponentParser = new ComponentParser(),
        specs: ComponentSpec[] = [],
        fileIO: IFileIO = new FileIO(),
        window: BrowserWindow = new BrowserWindow({
            title: "JamJar Editor",
            width: Editor.WINDOW_WIDTH,
            height: Editor.WINDOW_HEIGHT,
            show: false,
            resizable: true,
            webPreferences: {
                nodeIntegration: false,
                webgl: true,
                preload: path.resolve(__dirname, "../preload.js")
            },
        }),
        menu: Menu = new Menu(),
        application: App = app,
        dialogGlobal: Dialog = dialog,
        ipcMainProcess: IpcMain = ipcMain,
        setApplicationMenu: (menu: Menu | null) => void = Menu.setApplicationMenu) {
        this.devMode = devMode;
        this.devTools = devTools;
        this.projectManager = projectManager;
        this.workspaceManager = workspaceManager;
        this.project = project;
        this.templater = templater;
        this.compiler = compiler;

        this.scene = scene;
        this.componentParser = componentParser;
        this.specs = specs;
        this.window = window;
        this.menu = menu;
        this.project = project;
        this.fileIO = fileIO;
        this.application = application;
        this.dialogGlobal = dialogGlobal;
        this.ipcMainProcess = ipcMainProcess;
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
            if (result.filePaths.length != 1) {
                return;
            }
            this.projectManager.OpenProject(result.filePaths[0])
                .then((project: IProject) => {
                    this.workspaceManager.SaveWorkspace({ lastProjectPath: result.filePaths[0] } as IWorkspace);
                    const editor = new Editor(
                        this.devMode,
                        this.devTools,
                        this.projectManager,
                        this.workspaceManager,
                        project,
                        this.templater,
                        this.compiler
                    );
                    this.Close();
                    editor.Start();
                });
        });
    }

    private finishStart(): void {
        this.specs = [];
        for (const specPath of this.project.specs) {
            const componentSpec = this.componentParser.Parse(specPath, this.project.path);
            this.specs.push(componentSpec);
        }
        this.window.webContents.send(Messages.LOAD_COMPONENT_SPECS, this.specs);
    }

    private newScene(): void {
        this.dialogGlobal.showSaveDialog(this.window, {
            filters: [
                { name: "Scene TypeScript files", extensions: ["ts"] }
            ],
            defaultPath: path.dirname(this.project.path)
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
            const source = this.templater.GenerateSource(result.filePath);
            // Save new templated scene file
            this.fileIO.WriteFile(filePath, source, {})
                .then(() => {
                    this.updateScene(filePath, source, new Scene(filePath, []));
                });
        });
    }

    private updateScene(filePath: string, source: string, scene: Scene): void {
        this.project.lastScenePath = filePath;
        this.projectManager.SaveProject(this.project.path, this.project);
        this.scene = scene;
        this.compiler = new Compiler(filePath, source);
        this.window.webContents.send(Messages.OPEN_SCENE, this.scene);
        this.window.webContents.send(Messages.LOAD_COMPONENT_SPECS, this.specs);
        this.window.setTitle(`JamJar Editor - ${filePath}`);
    }

    private openScene(): void {
        this.dialogGlobal.showOpenDialog(this.window, {
            filters: [
                { name: "Scene TypeScript files", extensions: ["ts"] }
            ],
            defaultPath: path.dirname(this.project.path)
        }).then((result: OpenDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            if (result.filePaths.length !== 1) {
                return;
            }
            const filePath = result.filePaths[0];
            this.fileIO.ReadFile(filePath, {})
                .then((data) => {
                    this.updateScene(filePath, data.toString("utf8"), new Scene(filePath, []));
                });
        });
    }

    private saveScene(): void {
        if (this.scene === undefined) {
            return;
        }
        if (this.compiler === undefined) {
            return;
        }
        this.compiler.SetSpecs(this.specs);
        this.compiler.ModifyEntities(this.scene.entities);
        // Compile scene and write to file
        this.fileIO.WriteFile(this.scene.path, this.compiler.Compile(), {});
    }

    private newEntity(): void {
        if (this.scene === undefined) {
            return;
        }
        this.scene.entities.push(new Entity("test", []))
        // Send new entity message
        this.window.webContents.send(Messages.LOAD_SCENE, this.scene);
    }

    private importComponent(): void {
        this.dialogGlobal.showOpenDialog(this.window, {
            filters: [
                { name: "Component TypeScript files", extensions: ["ts"] }
            ],
            defaultPath: path.dirname(this.project.path)
        }).then((result: OpenDialogReturnValue) => {
            if (result.canceled) {
                return;
            }
            for (const specPath of result.filePaths) {
                const componentSpec = this.componentParser.Parse(specPath, this.project.path);
                this.specs.push(componentSpec);
                this.project.specs.push(specPath);
            }
            this.projectManager.SaveProject(this.project.path, this.project);
            // Send new component specs to the frontend
            this.window.webContents.send(Messages.LOAD_COMPONENT_SPECS, this.specs);
        });
    }

    private modifyScene(event: string | Symbol, sceneJSON: any): void {
        this.scene = Scene.Unmarshal(sceneJSON);
    }

    public Start(): void {
        const appMenuItems = this.createAppMenuItems();
        for (const appMenuItem of appMenuItems) {
            this.menu.append(appMenuItem);
        }
        this.setApplicationMenu(this.menu);
        this.window.loadFile(Editor.PAGE_PATH);
        if (this.devMode) {
            this.window.showInactive();
        } else {
            this.window.maximize();
        }
        if (this.devTools) {
            this.window.webContents.openDevTools();
        }
        this.ipcMainProcess.addListener(Messages.MODIFY_SCENE, this.modifyScene.bind(this));
        this.ipcMainProcess.addListener(Messages.FINISH_EDITOR_START, this.finishStart.bind(this));
        this.window.webContents.on("did-finish-load", () => {
            this.window.webContents.send(Messages.START_EDITOR);
            if (this.project.lastScenePath !== undefined) {
                const filePath = this.project.lastScenePath;
                this.fileIO.ReadFile(filePath, {})
                    .then((data) => {
                        this.updateScene(filePath, data.toString("utf8"), new Scene(filePath, []));
                    })
                    .catch((err) => {
                        if (err["code"] === "ENOENT") {
                            return;
                        }
                        throw (err);
                    });
            }
        });
    }

    public Close(): void {
        this.window.close();
    }

    private createAppMenuItems(): MenuItem[] {
        return [
            new MenuItem({
                label: Editor.MENU_FILE,
                submenu: [
                    {
                        label: Editor.MENU_FILE_OPEN_PROJECT,
                        click: this.openProject.bind(this)
                    },
                    {
                        label: Editor.MENU_FILE_NEW_SCENE,
                        click: this.newScene.bind(this)
                    },
                    {
                        label: Editor.MENU_FILE_OPEN_SCENE,
                        click: this.openScene.bind(this)
                    },
                    {
                        label: Editor.MENU_FILE_SAVE_SCENE,
                        click: this.saveScene.bind(this)
                    },
                    {
                        label: Editor.MENU_FILE_QUIT,
                        click: this.quit.bind(this)
                    }
                ]
            }),
            new MenuItem({
                label: Editor.MENU_ENTITY,
                submenu: [
                    {
                        label: Editor.MENU_ENTITY_NEW,
                        click: this.newEntity.bind(this)
                    },
                ]
            }),
            new MenuItem({
                label: Editor.MENU_COMPONENT,
                submenu: [
                    {
                        label: Editor.MENU_COMPONENT_IMPORT,
                        click: this.importComponent.bind(this)
                    },
                ]
            }),
        ]
    }
}

export default Editor;