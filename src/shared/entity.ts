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

    public static Unmarshal(json: any): Entity {
        const components: Component[] = [];
        for (const jsonComponent of json["components"]) {
            components.push(Component.Unmarshal(jsonComponent));
        }
        return new Entity(
            json["name"],
            components,
            json["id"]
        )
    }
}

export default Entity;