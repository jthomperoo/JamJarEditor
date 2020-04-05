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

    public static Unmarshal(json: any): Component {
        const properties: Property[] = [];
        for (const jsonProperty of json["properties"]) {
            properties.push(Property.Unmarshal(jsonProperty))
        }
        return new Component(
            json["specID"],
            properties,
            json["id"]
        )
    }
}

export default Component;