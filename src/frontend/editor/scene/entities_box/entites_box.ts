import IDisplay from "../../idisplay";
import Entity from "../../../../shared/entity";
import SceneDisplay from "../scene_display";
import SceneEdit from "../scene_edit";

class EntitiesBox extends SceneDisplay implements IDisplay {
    private entities: Entity[];

    constructor(element: HTMLElement, entities: Entity[] = [], sceneEdit?: SceneEdit, doc?: HTMLDocument) {
        super(element, sceneEdit, doc);
        this.entities = entities;
    }

    private selectEntity(entity: Entity): void {
        if (this.sceneEdit === undefined) {
            return;
        }
        this.sceneEdit.SetSelected(entity);
    }

    private deleteEntity(entity: Entity): void {
        if (this.sceneEdit === undefined) {
            return;
        }
        this.sceneEdit.DeleteEntity(entity);
    }

    public SetEntities(entities: Entity[]): void {
        this.entities = entities;
    }

    public Start(): void {

    }

    public Close(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
    }

    public Update(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }

        const entityListTitle = this.doc.createElement("h2");
        entityListTitle.innerText = "Entities";
        entityListTitle.id = "entity-list-title";
        entityListTitle.className = "ui-box-title";
        this.element.appendChild(entityListTitle);

        const entityList = this.doc.createElement("ul");
        entityList.id = "entity-list";
        entityList.className = "item-list";


        for (const entity of this.entities) {
            const entityItem = this.doc.createElement("li");
            entityItem.className = "entity-item";
            const entityButton = this.doc.createElement("a");
            entityButton.href = "#";
            entityButton.innerText = entity.name;
            entityButton.onclick = () => {
                this.selectEntity(entity);
            };
            entityItem.appendChild(entityButton);
            const entityDeleteButton = this.doc.createElement("button");
            entityDeleteButton.innerText = "Delete";
            entityDeleteButton.onclick = () => {
                this.deleteEntity(entity);
            };
            entityItem.appendChild(entityDeleteButton);
            entityList.appendChild(entityItem);
        }

        this.element.appendChild(entityList);
    }
}

export default EntitiesBox;