import System from "jamjar/lib/system/system";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import Vector from "jamjar/lib/geometry/vector";
import Camera from "jamjar/lib/standard/camera/camera";
import View from "./view";
import IMessage from "jamjar/lib/message/imessage";
import Message from "jamjar/lib/message/message";

class ViewSystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [View.KEY].every((type) => components.some(
            component => component.key == type
        ));
    }

    private canvas: HTMLCanvasElement;
    private win: Window;

    constructor(messageBus: IMessageBus, 
        canvas: HTMLCanvasElement,
        scene?: IScene | undefined, 
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined,
        win: Window = window) {
        super(messageBus, scene, ViewSystem.EVALUATOR, entities, subscriberID);
        this.canvas = canvas;
        this.win = win;
        this.win.addEventListener("resize", this.onResize.bind(this));
        this.messageBus.Subscribe(this, ["keydown"]);
    }

    public OnMessage(message: IMessage): void {
        super.OnMessage(message);
        switch(message.type) {
            case "keydown": {
                const keyMessage = message as Message<string>;
                if (keyMessage.payload === undefined) {
                    return;
                }
                const keyName = keyMessage.payload;
                let zoomAdjust = 0;
                if (keyName === "Minus") {
                    zoomAdjust = 0.01;
                }
                if (keyName === "Equal") {
                    zoomAdjust = -0.01;
                }
                if (zoomAdjust === 0) {
                    return;
                }
                for (const viewCamera of this.entities.values()) {
                    const view = viewCamera.Get(View.KEY) as View;
                    view.zoomLevel += zoomAdjust;
                }
                break;
            }
        }
    }

    public Update(): void {
        for (const viewCamera of this.entities.values()) {
            const view = viewCamera.Get(View.KEY) as View;
            const camera = viewCamera.Get(Camera.KEY) as Camera;
            camera.virtualScale = new Vector(this.canvas.width * view.zoomLevel, this.canvas.height * view.zoomLevel);
        }
    }

    private onResize(event: UIEvent): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
}

export default ViewSystem;