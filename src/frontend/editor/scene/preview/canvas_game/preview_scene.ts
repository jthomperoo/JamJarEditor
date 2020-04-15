import Scene from "jamjar/lib/scene/scene";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IEntity from "jamjar/lib/entity/ientity";
import Camera from "jamjar/lib/standard/camera/camera";
import Color from "jamjar/lib/rendering/color";
import Vector from "jamjar/lib/geometry/vector";
import Transform from "jamjar/lib/standard/transform/transform";
import Entity from "jamjar/lib/entity/entity";
import WebGLSystem from "jamjar/lib/standard/webgl/webgl_system";
import EntityManager from "jamjar/lib/entity/entity_manager";
import ImageAsset from "jamjar/lib/rendering/image_asset";
import Message from "jamjar/lib/message/message";
import TransformDisplaySystem from "./transform_display/transform_display_system";
import SpriteSystem from "jamjar/lib/standard/sprite/sprite_system";
import HTTPImageSystem from "jamjar/lib/standard/http_image/http_image_system";
import InterpolationSystem from "jamjar/lib/standard/interpolation/interpolation_system";
import JamJarEntitySystem from "./jamjar_entity/jamjar_entity_system";
import KeyboardSystem from "jamjar/lib/standard/keyboard/keyboard_system";
import View from "./view/view";
import ViewSystem from "./view/view_system";
import SelectedSystem from "./selected/selected_system";
import PointerSystem from "jamjar/lib/standard/pointer/pointer_system";
import EditorSystem from "./editor/editor_system";
import Preview from "../preview";

class PreviewScene extends Scene {
    private canvas: HTMLCanvasElement;
    private preview: Preview;
    constructor(messageBus: IMessageBus, canvas: HTMLCanvasElement, preview: Preview, entities?: IEntity[]) {
        super(messageBus, entities);
        this.canvas = canvas;
        this.preview = preview;
    }

    public Start(): void {
        super.Start();
        const gl = this.canvas.getContext("webgl2", { alpha: false });
        if (!gl) {
            throw ("WebGL2 not supported in this browser")
        }

        new EntityManager(this.messageBus);
        new SpriteSystem(this.messageBus, this);
        new WebGLSystem(this.messageBus, gl, this);
        new InterpolationSystem(this.messageBus, this);
        new HTTPImageSystem(this.messageBus, this);
        new TransformDisplaySystem(this.messageBus, this);
        new ViewSystem(this.messageBus, this.canvas, this);
        new JamJarEntitySystem(this.messageBus, this);
        new KeyboardSystem(this.messageBus, document, this);
        new PointerSystem(this.messageBus, this.canvas, this)
        new SelectedSystem(this.messageBus, this);
        new EditorSystem(this.messageBus, this.preview, this);

        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["selected", "../../assets/selected_placeholder.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["rotate", "../../assets/rotate.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["translate_x", "../../assets/red_arrow.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["translate_y", "../../assets/blue_arrow.png"]));

        const camera = new Entity(this.messageBus);
        camera.Add(new Transform(new Vector(0,0)));
        camera.Add(new Camera(new Color(0.5,0.5,0.5), undefined, undefined, new Vector(this.canvas.width, this.canvas.height)));
        camera.Add(new View(0.05)); 
        this.AddEntity(camera);
    }
}

export default PreviewScene;