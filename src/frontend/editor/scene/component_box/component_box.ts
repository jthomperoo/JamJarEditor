import ComponentSpec from "../../../../shared/component_spec";
import IDisplay from "../../idisplay";
import SceneDisplay from "../scene_display";
import SceneEdit from "../scene_edit";

class ComponentBox extends SceneDisplay implements IDisplay {

    private specs: ComponentSpec[];

    constructor(element: HTMLElement,
        sceneEdit?: SceneEdit,
        specs: ComponentSpec[] = [],
        doc?: HTMLDocument) {
        super(element, sceneEdit, doc)
        this.specs = specs;
    }

    public SetSpecs(specs: ComponentSpec[]): void {
        this.specs = specs;
    }

    public Start(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
    }

    public Update(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }

        const componentListTitle = this.doc.createElement("h2");
        componentListTitle.innerText = "Components";
        componentListTitle.id = "component-list-title";
        componentListTitle.className = "ui-box-title";
        this.element.appendChild(componentListTitle);

        const componentList = this.doc.createElement("ul");
        componentList.id = "component-list";
        componentList.className = "item-list";

        for (const spec of this.specs) {
            // Component Box
            const componentBox = this.doc.createElement("li");
            componentBox.className = "component-item";

            // Component Name
            const componentName = this.doc.createElement("a");
            componentName.href = "#";
            componentName.className = "component-name";
            componentName.innerText = spec.name;
            componentName.onclick = () => {
                if (this.sceneEdit === undefined) {
                    return;
                }
                this.sceneEdit.AddComponentToSelected(spec)
            };
            componentBox.appendChild(componentName);
            componentList.appendChild(componentBox);
        }
        this.element.appendChild(componentList);
    }

    public Close(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
    }
}

export default ComponentBox;