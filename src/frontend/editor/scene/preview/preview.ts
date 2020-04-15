import IDisplay from "../../idisplay";
import SceneDisplay from "../scene_display";
import SceneEdit from "../scene_edit";
import Scene from "../../../../shared/scene";
import PreviewGame from "./canvas_game/preview_game";
import MessageBus from "jamjar/lib/message/message_bus";
import ComponentSpec from "../../../../shared/component_spec";
import Entity from "../../../../shared/entity";

class Preview extends SceneDisplay implements IDisplay {
    private scene?: Scene;
    private game?: PreviewGame;
    constructor(element: HTMLElement, 
        game?: PreviewGame, 
        scene?: Scene, 
        sceneEdit?: SceneEdit, 
        doc?: HTMLDocument) {
        super(element, sceneEdit, doc);
        this.game = game;
    }

    public SelectEntity(entity: Entity): void {
        if (this.game !== undefined) {
            this.game.SelectEntity(entity.id);
        }
    }

    public SetSpecs(specs: ComponentSpec[]) {
        if (this.game !== undefined) {
            this.game.LoadSpecs(specs);
        }
    }

    public SetScene(scene: Scene): void {
        this.scene = scene;
        if (this.game !== undefined) {
            this.game.LoadScene(scene);
        }
    }

    public ModifyEntity(): void {
        if (this.sceneEdit !== undefined) {
            this.sceneEdit.ModifyEntity()
        }
    }

    public Start(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
        const newSceneMessage = this.doc.createElement("span");
        newSceneMessage.id = "preview-open-scene-message";
        newSceneMessage.className = "open-scene-message";
        newSceneMessage.innerText = "Create a new Scene or open an existing one to start.";
        this.element.appendChild(newSceneMessage);
    }

    public Close(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
        if (this.game !== undefined) {
            this.game.Destroy();
        }
    }

    public Update(): void {  
        const newSceneMessage = document.getElementById("preview-open-scene-message");
        if (newSceneMessage !== null) {
            while (this.element.firstChild !== null) {
                this.element.firstChild.remove();
            }
            const canvas = this.doc.createElement("canvas");
            canvas.id = "scene-canvas";
            canvas.width = 200;
            canvas.height = 200;
            this.element.appendChild(canvas);

            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.game = new PreviewGame(new MessageBus(), canvas, this);
            this.game.Start();
        }
    }
}

export default Preview;