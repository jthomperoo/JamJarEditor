import Scene from "../../../shared/scene";
import EntitiesBox from "./entities_box/entites_box";
import SelectedBox from "./selected_box/selected_box";
import Preview from "./preview/preview";
import IDisplay from "../idisplay";
import Entity from "../../../shared/entity";
import ComponentSpec from "../../../shared/component_spec";
import ComponentBox from "./component_box/component_box";
import Messages from "../../../shared/messages";

class SceneEdit implements IDisplay {
    private componentBox: ComponentBox;
    private entitiesBox: EntitiesBox;
    private selectedBox: SelectedBox;
    private preview: Preview;
    private scene?: Scene;
    private ipcRendererProcess: any;

    constructor(
        componentBox: ComponentBox,
        entitiesBox: EntitiesBox,
        selectedBox: SelectedBox,
        preview: Preview, 
        scene?: Scene,
        ipcRendererProcess: any = window.ipcRenderer
    ) {
        this.scene = scene;
        this.componentBox = componentBox
        this.entitiesBox = entitiesBox;
        this.selectedBox = selectedBox;
        this.preview = preview;
        this.ipcRendererProcess = ipcRendererProcess;
    }

    private loadComponentSpecs(event: any, specsJSON: any): void {
        const specs: ComponentSpec[] = [];
        for (const specJSON of specsJSON) {
            specs.push(ComponentSpec.Unmarshal(specJSON));
        }
        this.preview.SetSpecs(specs);
        this.selectedBox.SetSpecs(specs);
        this.componentBox.SetSpecs(specs);
        this.Update();
    }

    private loadScene(event: any, sceneJSON: any): void {
        this.scene = Scene.Unmarshal(sceneJSON);
        this.preview.SetScene(this.scene);
        this.entitiesBox.SetEntities(this.scene.entities);
        this.Update();
    }

    public AddComponentToSelected(spec: ComponentSpec): void {
        this.selectedBox.AddComponent(spec);
        this.ipcRendererProcess.send(Messages.MODIFY_SCENE, this.scene);
        this.Update();
    }

    public DeleteEntity(entity: Entity): void {
        if (this.scene === undefined) {
            return;
        }
        for (let i = 0; i < this.scene.entities.length; i++) {
            const searchEntity = this.scene.entities[i];
            if (searchEntity.id === entity.id) {
                this.scene.entities.splice(i, 1);
                break;
            }
        }
        this.selectedBox.DeselectIfEntityDeleted(entity);
        this.ipcRendererProcess.send(Messages.MODIFY_SCENE, this.scene);
        this.Update();
    }

    public ModifyEntity(): void {
        this.ipcRendererProcess.send(Messages.MODIFY_SCENE, this.scene);
        this.Update();
    }

    public SetSelected(entity: Entity): void {
        this.preview.SelectEntity(entity);
        this.selectedBox.SetSelected(entity);
        this.Update();
    }

    public Start(): void {
        this.ipcRendererProcess.on(Messages.LOAD_SCENE, this.loadScene.bind(this));
        this.ipcRendererProcess.on(Messages.LOAD_COMPONENT_SPECS, this.loadComponentSpecs.bind(this));

        this.componentBox.SetSceneEdit(this);
        this.preview.SetSceneEdit(this);
        this.selectedBox.SetSceneEdit(this);
        this.entitiesBox.SetSceneEdit(this);

        if (this.scene !== undefined) {
            this.preview.SetScene(this.scene);
            this.entitiesBox.SetEntities(this.scene.entities);
        }

        this.componentBox.Start();
        this.preview.Start();
        this.selectedBox.Start();
        this.entitiesBox.Start();
        this.Update();
    }

    public Close(): void {
        this.ipcRendererProcess.removeListener(Messages.LOAD_SCENE, this.loadScene.bind(this));
        this.ipcRendererProcess.removeListener(Messages.LOAD_COMPONENT_SPECS, this.loadComponentSpecs.bind(this));
        this.componentBox.Close();
        this.preview.Close();
        this.selectedBox.Close();
        this.entitiesBox.Close();
    }

    public Update(): void {
        this.componentBox.Update();
        this.preview.Update();
        this.selectedBox.Update();
        this.entitiesBox.Update();
    }
}

export default SceneEdit;