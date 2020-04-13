import System from "jamjar/lib/system/system";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import ResizableCamera from "./resizable_camera";
import Vector from "jamjar/lib/geometry/vector";
import Camera from "jamjar/lib/standard/camera/camera";


class CanvasResizeSystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [ResizableCamera.KEY].every((type) => components.some(
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
        super(messageBus, scene, CanvasResizeSystem.EVALUATOR, entities, subscriberID);
        this.canvas = canvas;
        this.win = win;
        this.win.addEventListener("resize", this.onResize.bind(this));
    }

    public Update(): void {
        for (const resizableCamera of this.entities.values()) {
            const resizableComponent = resizableCamera.Get(ResizableCamera.KEY) as ResizableCamera;
            const camera = resizableCamera.Get(Camera.KEY) as Camera;
            camera.virtualScale = new Vector(this.canvas.width * resizableComponent.zoomLevel, this.canvas.height * resizableComponent.zoomLevel);
        }
    }

    private onResize(event: UIEvent): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
}

export default CanvasResizeSystem;