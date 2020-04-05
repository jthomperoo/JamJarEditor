import IDisplay from "../../idisplay";
import SceneDisplay from "../scene_display";
import SceneEdit from "../scene_edit";
import Scene from "../../../../shared/scene";
import PreviewGame from "./canvas_game/preview_game";
import MessageBus from "jamjar/lib/message/message_bus";

class Preview extends SceneDisplay implements IDisplay {
    private scene?: Scene;
    private game?: PreviewGame;
    constructor(element: HTMLElement, game?: PreviewGame, scene?: Scene, sceneEdit?: SceneEdit, doc?: HTMLDocument) {
        super(element, sceneEdit, doc);
        this.game = game;
    }

    public SetScene(scene: Scene): void {
        this.scene = scene;
    }

    public Start(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
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
        if (this.scene === undefined) {
            while (this.element.firstChild !== null) {
                this.element.firstChild.remove();
            }
            const newSceneMessage = this.doc.createElement("span");
            newSceneMessage.className = "open-scene-message";
            newSceneMessage.innerText = "Create a new Scene or open an existing one to start.";
            this.element.appendChild(newSceneMessage);
            return;
        }
        const firstElement = this.element.firstChild;
        if (firstElement === null || (firstElement as HTMLElement).className === "open-scene-message") {
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
            this.game = new PreviewGame(new MessageBus(), canvas);
            this.game.Start();
        }
    }
}

export default Preview;