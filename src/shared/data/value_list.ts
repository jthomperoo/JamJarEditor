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

class ValueList {
    public items: Value[];
    public defaultValue: Value;
    constructor(items: Value[], defaultValue: Value) {
        this.items = items;
        this.defaultValue = defaultValue;
    }

    public Copy(): ValueList {
        const copied: Value[] = [];
        for (const item of this.items) {
            copied.push(item.Copy());
        }
        return new ValueList(
            copied,
            this.defaultValue.Copy()
        );
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public static Unmarshal(json: any): ValueList {
        const items: Value[] = [];
        for (const jsonItem of json["items"]) {
            items.push(Value.Unmarshal(jsonItem));
        }
        return new ValueList(
            items,
            Value.Unmarshal(json["defaultValue"])
        );
    }
}

export default ValueList;