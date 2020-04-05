import Entity from "./entity";

class Scene {
    public path: string;
    public entities: Entity[];
    constructor(path: string, entities: Entity[]) {
        this.path = path;
        this.entities = entities;
    }

    public static Unmarshal(json: any): Scene {
        const entities: Entity[] = [];
        for (const jsonEntity of json["entities"]) {
            entities.push(Entity.Unmarshal(jsonEntity));
        }
        return new Scene(
            json["path"],
            entities
        );
    }
}

export default Scene;