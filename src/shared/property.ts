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
        )
    }

    public static Unmarshal(json: any): Property {
        return new Property(
            json["name"],
            json["optional"],
            json["provided"],
            Value.Unmarshal(json["value"])
        )
    }
}

export default Property;