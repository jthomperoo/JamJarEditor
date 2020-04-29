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

import Scene from "../data/scene";
import ISceneState from "./iscene_state";
import ComponentSpec from "../data/component_spec";
import Entity from "../data/entity";

class SceneState implements ISceneState {
    private scene?: Scene;
    private specs: ComponentSpec[];

    constructor(scene?: Scene, specs: ComponentSpec[] = []) {
        this.scene = scene;
        this.specs = specs;
    }

    public UpdateEntity(update: Entity): void {
        if (this.scene === undefined) {
            return;
        }

        let updated = false;
        for (let i = 0; i < this.scene.entities.length; i++) {
            const entity = this.scene.entities[i];
            if (entity.id === update.id) {
                updated = true;
                this.scene.entities[i] = update.Copy();
            }
        }

        if (updated) {
            return;
        }

        this.scene.entities.push(update.Copy());
    }

    public SetScene(scene: Scene | undefined): void {
        if (scene === undefined) {
            this.scene = undefined;
            return;
        }
        this.scene = scene.Copy();
    }

    public SetSpecs(specs: ComponentSpec[]): void {
        const copied: ComponentSpec[] = [];
        for (const spec of specs) {
            copied.push(spec.Copy());
        }
        this.specs = copied;
    }

    public GetScene(): Scene | undefined {
        if (this.scene === undefined) {
            return undefined;
        }
        return this.scene.Copy();
    }
    
    public GetSpecs(): ComponentSpec[] {
        const copied: ComponentSpec[] = [];
        for (const spec of this.specs) {
            copied.push(spec.Copy());
        }
        return copied;
    }

    public GetSpecMap(): Map<number, ComponentSpec> {
        const specMap = new Map<number, ComponentSpec>();
        for (const spec of this.specs) {
            specMap.set(spec.id, spec.Copy());
        }
        return specMap;
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public GetJSON(): any {
        return {
            specs: this.specs,
            scene: this.scene
        };
    }
}

export default SceneState;