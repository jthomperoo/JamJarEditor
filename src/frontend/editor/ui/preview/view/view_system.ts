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

import System from "jamjar/lib/system/system";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import Vector from "jamjar/lib/geometry/vector";
import Camera from "jamjar/lib/standard/camera/camera";
import IMessage from "jamjar/lib/message/imessage";
import Message from "jamjar/lib/message/message";
import View from "./view";

class ViewSystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [View.KEY, Camera.KEY].every((type) => components.some(
            component => component.key === type
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
    }

    public Update(): void {
        for (const viewCamera of this.entities.values()) {
            const view = viewCamera.Get(View.KEY) as View;
            const camera = viewCamera.Get(Camera.KEY) as Camera;
            camera.virtualScale = new Vector(this.canvas.width, this.canvas.height);
        }
    }

    private onResize(event: UIEvent): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
}

export default ViewSystem;