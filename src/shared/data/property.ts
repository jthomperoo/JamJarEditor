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

import Value from "./value";

class Property {
    public static ID = 0;
    public id: number;
    public name: string;
    public optional: boolean;
    public provided: boolean;
    public value: Value;

    constructor(name: string, 
        optional: boolean,
        provided: boolean, 
        value: Value, 
        id = Property.ID++) {
        this.id = id;
        this.name = name;
        this.provided = provided;
        this.optional = optional;
        this.value = value;
    }

    public Copy(): Property {
        return new Property(
            this.name,
            this.optional,
            this.provided,
            this.value.Copy()
        );
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): Property {
        return new Property(
            json["name"],
            json["optional"],
            json["provided"],
            Value.Unmarshal(json["value"])
        );
    }
}

export default Property;