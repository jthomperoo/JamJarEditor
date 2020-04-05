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

    public static Unmarshal(json: any): ComponentSpec {
        const definition: Property[] = [];
        for (const jsonProperty of json["definition"]) {
            definition.push(Property.Unmarshal(jsonProperty))
        }
        return new ComponentSpec(
            json["name"],
            json["path"],
            definition,
            json["id"]
        )
    }
}

export default ComponentSpec;