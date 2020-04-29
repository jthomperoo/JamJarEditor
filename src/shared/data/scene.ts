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

import Entity from "./entity";

class Scene {
    public path: string;
    public entities: Entity[];
    constructor(path: string, entities: Entity[]) {
        this.path = path;
        this.entities = entities;
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Scene {
        const entities: Entity[] = [];
        for (const jsonEntity of json["entities"]) {
            entities.push(Entity.Unmarshal(jsonEntity));
        }
        return new Scene(
            json["path"],
            entities
        );
    }

    public Copy(): Scene {
        const copiedEntities: Entity[] = [];
        for (const entity of this.entities) {
            copiedEntities.push(entity.Copy());
        }
        return new Scene(
            this.path,
            copiedEntities
        );
    }
}

export default Scene;