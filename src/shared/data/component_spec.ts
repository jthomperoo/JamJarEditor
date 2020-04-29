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

import Property from "./property";
import Component from "./component";

class ComponentSpec {
    public static ID = 0;

    public id: number;
    public name: string;
    public path: string;
    public definition: Property[];

    constructor(name: string, path: string, properties: Property[], id: number = ComponentSpec.ID++) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.definition = properties;
    }

    public GenerateComponent(): Component {
        const properties: Property[] = [];
        for (const property of this.definition) {
            properties.push(property.Copy());
        }
        return new Component(
            this.id,
            properties
        );
    }
    
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): ComponentSpec {
        const definition: Property[] = [];
        for (const jsonProperty of json["definition"]) {
            definition.push(Property.Unmarshal(jsonProperty));
        }
        return new ComponentSpec(
            json["name"],
            json["path"],
            definition,
            json["id"]
        );
    }

    public Copy(): ComponentSpec {
        const definition: Property[] = [];
        for (const property of this.definition) {
            definition.push(property.Copy());
        }
        return new ComponentSpec(
            this.name,
            this.path,
            definition,
            this.id
        );
    }
}

export default ComponentSpec;