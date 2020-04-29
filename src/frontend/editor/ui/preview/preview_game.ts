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

import Game from "jamjar/lib/game";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import PreviewScene from "./preview_scene";
import Scene from "../../../../shared/data/scene";
import Message from "jamjar/lib/message/message";
import ComponentSpec from "../../../../shared/data/component_spec";
import Preview from "./preview";
import EntityManager from "jamjar/lib/entity/entity_manager";
import SpriteSystem from "jamjar/lib/standard/sprite/sprite_system";
import WebGLSystem from "jamjar/lib/standard/webgl/webgl_system";
import InterpolationSystem from "jamjar/lib/standard/interpolation/interpolation_system";
import HTTPImageSystem from "jamjar/lib/standard/http_image/http_image_system";

class PreviewGame extends Game {

    public static readonly MESSAGE_LOAD_SCENE = "load_scene";
    public static readonly MESSAGE_LOAD_SPECS = "load_specs";
    public static readonly MESSAGE_SELECT_ENTITY = "select_entity";

    private static readonly NAME = "preview";

    private canvas: HTMLCanvasElement;

    constructor(messageBus: IMessageBus, 
        canvas: HTMLCanvasElement, 
        frameRequestCallback?: (callback: FrameRequestCallback) => number) {
        super(messageBus, PreviewGame.NAME, frameRequestCallback);
        this.canvas = canvas;
    }

    public Start(): void {
        super.Start();
        const gl = this.canvas.getContext("webgl2", { alpha: false });
        if (!gl) {
            throw ("WebGL2 not supported in this browser");
        }

        new SpriteSystem(this.messageBus);
        new WebGLSystem(this.messageBus, gl);
        new EntityManager(this.messageBus);
        new InterpolationSystem(this.messageBus);
        new HTTPImageSystem(this.messageBus);

        new PreviewScene(this.messageBus, this.canvas).Start();
    }
}

export default PreviewGame;