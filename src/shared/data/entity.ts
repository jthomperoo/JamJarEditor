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

import Component from "./component";

class Entity {
    public static ID = 0;
    public id: number;
    public name: string;
    public components: Component[];
    constructor(name: string, components: Component[], id: number = Entity.ID++) {
        this.id = id;
        this.name = name;
        this.components = components;
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Entity {
        const components: Component[] = [];
        for (const jsonComponent of json["components"]) {
            components.push(Component.Unmarshal(jsonComponent));
        }
        return new Entity(
            json["name"],
            components,
            json["id"]
        );
    }

    public Copy(): Entity {
        const copiedComponents: Component[] = [];
        for (const component of this.components) {
            copiedComponents.push(component.Copy());
        }
        return new Entity(
            this.name,
            copiedComponents,
            this.id
        );
    }
}

export default Entity;