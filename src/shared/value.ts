import Property from "./property";
import ValueList from "./value_list";

class Value {
    public type: string;
    public value: number | string | boolean | ValueList | Property[];
    public path: string | undefined;

    constructor(type: string, 
        value: number | string | boolean | ValueList| Property[], 
        path: string | undefined) {
        this.type = type;
        this.value = value;
        this.path = path;
    }

    public Copy(): Value {
        let value: number | string | boolean | ValueList | Property[];
        switch(this.type) {
            case "number":
            case "string":
            case "boolean":  {
                if (this.type !== typeof this.value) {
                    throw(`Invalid type, expected ${this.type}, got ${typeof this.value}`)
                }
                value = this.value;
                break;
            }
            case "array": {
                if (!(this.value instanceof ValueList)) {
                    throw(`Invalid type, expected ${this.type}, got ${typeof this.value}`)
                }
                value = this.value.Copy();
                break;
            }
            default: {
                if (!(this.value instanceof Array)) {
                    throw(`Invalid type, expected ${this.type}, got ${typeof this.value}`)
                }
                value = [] as Property[];
                for (const valueItem of this.value) {
                    value.push(valueItem.Copy() as Property);
                }
                break;
            }
        }
        return new Value(
            this.type,
            value,
            this.path,
        );
    }

    public static Unmarshal(json: any): Value {
        const type = json["type"];
        let value: number | string | boolean | ValueList | Property[];
        switch(type) {
            case "number": 
            case "string":
            case "boolean": {
                value = json["value"];
                break;
            }
            case "array": {
                value = ValueList.Unmarshal(json["value"]);
                break;
            }
            default: {
                const properties: Property[] = [];
                for (const jsonProperty of json["value"]) {
                    properties.push(Property.Unmarshal(jsonProperty));
                }
                value = properties;
            }
        }
        return new Value(
            type,
            value,
            json["path"]
        );
    }
}

export default Value;