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