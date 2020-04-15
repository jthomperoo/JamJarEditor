import Game from "jamjar/lib/game";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import PreviewScene from "./preview_scene";
import Scene from "../../../../../shared/scene";
import Message from "jamjar/lib/message/message";
import ComponentSpec from "../../../../../shared/component_spec";
import Preview from "../preview";

class PreviewGame extends Game {

    public static readonly MESSAGE_LOAD_SCENE = "load_scene";
    public static readonly MESSAGE_LOAD_SPECS = "load_specs";
    public static readonly MESSAGE_SELECT_ENTITY = "select_entity";

    private static readonly NAME = "preview";

    private canvas: HTMLCanvasElement;
    private mainScene?: PreviewScene;
    private preview: Preview;
    constructor(messageBus: IMessageBus, 
        canvas: HTMLCanvasElement, 
        preview: Preview,
        mainScene?: PreviewScene, 
        frameRequestCallback?: (callback: FrameRequestCallback) => number) {
        super(messageBus, PreviewGame.NAME, frameRequestCallback);
        this.canvas = canvas;
        this.mainScene = mainScene;
        this.preview = preview;
    }

    public Start(): void {
        super.Start();
        this.mainScene = new PreviewScene(this.messageBus, this.canvas, this.preview);
        this.mainScene.Start();
    }

    public Destroy(): void {
        if (this.mainScene === undefined) {
            return;
        }
        this.mainScene.Destroy();
    }

    public SelectEntity(id: number): void {
        this.messageBus.Publish(new Message<number>(PreviewGame.MESSAGE_SELECT_ENTITY, id));
    }

    public LoadScene(scene: Scene): void {
        this.messageBus.Publish(new Message<Scene>(PreviewGame.MESSAGE_LOAD_SCENE, scene));
    }

    public LoadSpecs(specs: ComponentSpec[]): void {
        let specMap: Map<number, ComponentSpec> = new Map();
        for (const spec of specs) {
            specMap.set(spec.id, spec);
        }
        this.messageBus.Publish(new Message<Map<number, ComponentSpec>>(PreviewGame.MESSAGE_LOAD_SPECS, specMap));
    }
}

export default PreviewGame;