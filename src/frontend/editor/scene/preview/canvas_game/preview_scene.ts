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
import Sprite from "jamjar/lib/standard/sprite/sprite";
import SpriteSystem from "jamjar/lib/standard/sprite/sprite_system";
import HTTPImageSystem from "jamjar/lib/standard/http_image/http_image_system";
import InterpolationSystem from "jamjar/lib/standard/interpolation/interpolation_system";
import Material from "jamjar/lib/rendering/material";
import Texture from "jamjar/lib/rendering/texture";
import Polygon from "jamjar/lib/standard/shape/polygon";
import CanvasResizeSystem from "./canvas_resize/canvas_resize_system";
import ResizableCamera from "./canvas_resize/resizable_camera";

class PreviewScene extends Scene {
    private canvas: HTMLCanvasElement;
    constructor(messageBus: IMessageBus, canvas: HTMLCanvasElement, entities?: IEntity[]) {
        super(messageBus, entities);
        this.canvas = canvas;
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
        new CanvasResizeSystem(this.messageBus, this.canvas, this);

        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["selected", "../../assets/selected_placeholder.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["rotate_arrow", "../../assets/rotate.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["x_dir_arrow", "../../assets/red_arrow.png"]));
        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["y_dir_arrow", "../../assets/blue_arrow.png"]));

        const camera = new Entity(this.messageBus);
        camera.Add(new Transform(new Vector(0,0)));
        camera.Add(new Camera(new Color(0.5,0.5,0.5), undefined, undefined, new Vector(this.canvas.width, this.canvas.height)));
        camera.Add(new ResizableCamera(0.3));
        this.AddEntity(camera);

        const selectedEntity = new Entity(this.messageBus);
        selectedEntity.Add(new Transform(new Vector(0,0), new Vector(15, 15)));
        selectedEntity.Add(new Sprite(new Material(
            new Texture("selected", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
        ), 0));
        this.AddEntity(selectedEntity);

        const rotateArrow = new Entity(this.messageBus);
        rotateArrow.Add(new Transform(new Vector(0, 20), new Vector(20, 20)));
        rotateArrow.Add(new Sprite(new Material(
            new Texture("rotate_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
        ), 0));
        this.AddEntity(rotateArrow);

        const xDirArrow = new Entity(this.messageBus);
        xDirArrow.Add(new Transform(new Vector(12.5, 0), new Vector(10, 10), Math.PI/2));
        xDirArrow.Add(new Sprite(new Material(
            new Texture("x_dir_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
        ), 0));
        this.AddEntity(xDirArrow);

        const yDirArrow = new Entity(this.messageBus);
        yDirArrow.Add(new Transform(new Vector(0, 12.5), new Vector(10, 10)));
        yDirArrow.Add(new Sprite(new Material(
            new Texture("y_dir_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
        ), 0));
        this.AddEntity(yDirArrow);
    }
}

export default PreviewScene;