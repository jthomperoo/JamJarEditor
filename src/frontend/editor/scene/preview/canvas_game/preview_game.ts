import Game from "jamjar/lib/game";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import PreviewScene from "./preview_scene";

class PreviewGame extends Game {
    public static readonly NAME = "preview";
    private canvas: HTMLCanvasElement;
    private mainScene?: PreviewScene;
    constructor(messageBus: IMessageBus, canvas: HTMLCanvasElement, mainScene?: PreviewScene, frameRequestCallback?: (callback: FrameRequestCallback) => number) {
        super(messageBus, PreviewGame.NAME, frameRequestCallback);
        this.canvas = canvas;
        this.mainScene = mainScene;
    }

    public Start(): void {
        super.Start();
        this.mainScene = new PreviewScene(this.messageBus, this.canvas);
        this.mainScene.Start();
    }

    public Destroy(): void {
        if (this.mainScene === undefined) {
            return;
        }
        this.mainScene.Destroy();
    }
}

export default PreviewGame;