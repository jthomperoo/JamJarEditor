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

class Component {
    public static ID = 0;

    public id: number;
    public specID: number;
    public properties: Property[];

    constructor(specID: number, properties: Property[], id: number = Component.ID++) {
        this.id = id;
        this.specID = specID;
        this.properties = properties;
    }

    public Copy(): Component {
        const properties: Property[] = [];
        for (const property of this.properties) {
            properties.push(property.Copy());
        }
        return new Component(
            this.specID,
            properties
        );
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Component {
        const properties: Property[] = [];
        for (const jsonProperty of json["properties"]) {
            properties.push(Property.Unmarshal(jsonProperty));
        }
        return new Component(
            json["specID"],
            properties,
            json["id"]
        );
    }
}

export default Component;