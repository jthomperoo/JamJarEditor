/*
Copyright 2020 JamJar Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import Scene from "jamjar/lib/scene/scene";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IEntity from "jamjar/lib/entity/ientity";
import Camera from "jamjar/lib/standard/camera/camera";
import Color from "jamjar/lib/rendering/color";
import Vector from "jamjar/lib/geometry/vector";
import Transform from "jamjar/lib/standard/transform/transform";
import Entity from "jamjar/lib/entity/entity";
import ImageAsset from "jamjar/lib/rendering/image_asset";
import Message from "jamjar/lib/message/message";
import Sprite from "jamjar/lib/standard/sprite/sprite";
import View from "./view/view";
import ViewSystem from "./view/view_system";
import Material from "jamjar/lib/rendering/material";
import Texture from "jamjar/lib/rendering/texture";
import Polygon from "jamjar/lib/standard/shape/polygon";

class PreviewScene extends Scene {
    private canvas: HTMLCanvasElement;
    constructor(messageBus: IMessageBus, canvas: HTMLCanvasElement, entities?: IEntity[]) {
        super(messageBus, entities);
        this.canvas = canvas;
    }

    public Start(): void {
        super.Start();

        this.messageBus.Publish(new Message<[string, string]>(ImageAsset.MESSAGE_REQUEST_LOAD, ["selected", "../../assets/placeholder.png"]));

        new ViewSystem(this.messageBus, this.canvas, this);

        const camera = new Entity(this.messageBus);
        camera.Add(new Transform(new Vector(0,0)));
        camera.Add(new Camera(new Color(0.5,0.5,0.5), undefined, undefined, new Vector(this.canvas.width, this.canvas.height)));
        camera.Add(new View()); 
        this.AddEntity(camera);

        const placeholder = new Entity(this.messageBus);
        placeholder.Add(new Transform(new Vector(0,0), new Vector(100,100)));
        placeholder.Add(new Sprite(
            new Material(
                new Texture(
                    "selected",
                    Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array()
                )
            ), 0
        ));
        this.AddEntity(placeholder);
    }
}

export default PreviewScene;