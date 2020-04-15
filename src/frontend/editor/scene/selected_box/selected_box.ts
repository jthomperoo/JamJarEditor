import IDisplay from "../../idisplay";
import Entity from "../../../../shared/entity";
import SceneDisplay from "../scene_display";
import SceneEdit from "../scene_edit";
import Component from "../../../../shared/component";
import Property from "../../../../shared/property";
import Value from "../../../../shared/value";
import ValueList from "../../../../shared/value_list";
import ComponentSpec from "../../../../shared/component_spec";

class SelectedBox extends SceneDisplay implements IDisplay {
    private selected?: Entity;
    private specs: Map<number, ComponentSpec>;
    constructor(element: HTMLElement, selected?: Entity, specs: Map<number, ComponentSpec> = new Map(), sceneEdit?: SceneEdit, doc?: HTMLDocument) {
        super(element, sceneEdit, doc);
        this.selected = selected;
        this.specs = specs;
    }

    public AddComponent(spec: ComponentSpec): void {
        if (this.selected === undefined) {
            return;
        }
        for (const component of this.selected.components) {
            if (component.specID === spec.id) {
                return;
            }
        }
        this.selected.components.push(spec.GenerateComponent());
    }

    public SetSpecs(specs: ComponentSpec[]): void {
        this.specs = new Map();
        for (const spec of specs) {
            this.specs.set(spec.id, spec);
        }
    }

    public SetSelected(selected: Entity | undefined): void {
        this.selected = selected;
    }

    public DeselectIfEntityDeleted(entity: Entity): void {
        if (this.selected === undefined) {
            return;
        }
        if (entity.id === this.selected.id) {
            this.selected = undefined;
        }
    }

    public Start(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }
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

        if (this.selected === undefined) {
            const title = this.doc.createElement("span");
            title.id = "selected-entity-name";
            title.innerText = "None Selected";
            this.element.appendChild(title);
            return;
        }

        const title = this.doc.createElement("input");
        title.id = "selected-entity-name";
        title.type = "text";
        title.value = this.selected.name;
        title.onchange = () => {
            if (this.selected === undefined) {
                return;
            }
            this.selected.name = title.value;
            this.modifyEntity();
        }
        this.element.appendChild(title);
        
        const componentList = this.doc.createElement("ul");
        componentList.id = "selected-components";
        componentList.className = "item-list";
        for (const component of this.selected.components) {
            const spec = this.specs.get(component.specID);
            if (spec === undefined) {
                throw(`Using component without a spec; ${component}`);
            }
            // Component Element
            const componentItem = this.doc.createElement("li");
            componentItem.className = "selected-component";

            // Component Name Element
            const componentName = this.doc.createElement("span");
            componentName.className = "selected-component-name";
            componentName.innerText = spec.name;
            componentItem.appendChild(componentName);

            const componentDeleteButton = this.doc.createElement("button");
            componentDeleteButton.className = "selected-component-delete";
            componentDeleteButton.innerText = "delete";
            componentDeleteButton.onclick = () => {
                if (this.selected === undefined) {
                    return;
                }
                for(let i = 0; i < this.selected.components.length; i++) {
                    if (component.id === this.selected.components[i].id) {
                        this.selected.components.splice(i, 1);
                    }
                }
                this.modifyEntity();
            };
            componentItem.appendChild(componentDeleteButton);

            // Properties
            const propertyList = this.doc.createElement("ul");
            propertyList.className = "selected-list";
            for (const property of component.properties) {
                const propertyItem = this.generatePropertyElements(component, property);
                propertyList.appendChild(propertyItem);
            }
            componentItem.appendChild(propertyList);

            componentList.appendChild(componentItem);
        }
        this.element.appendChild(componentList);
    }

    private modifyEntity(): void {
        if (this.sceneEdit === undefined) {
            return;
        }
        if (this.selected === undefined) {
            return;
        }
        console.log(this.selected);
        this.sceneEdit.ModifyEntity();
    }

    private generateValueElements(component: Component, property: Property, value: Value, index?: number) {
        switch(value.type) {
            case "number": {
                if (typeof value.value != "number") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const numberEntry = this.doc.createElement("input");
                numberEntry.type = "number";
                numberEntry.required = true;
                numberEntry.className = "component-number-entry";
                numberEntry.step = "any";
                numberEntry.value = value.value.toString();
                numberEntry.onchange = () => {
                    const val = parseFloat(numberEntry.value);
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`)
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                        }
                        property.value.value.items[index].value = val;
                    } else {
                        property.value.value = val;
                    }
                    this.modifyEntity();
                };
                return numberEntry;
            }
            case "string": {
                if (typeof value.value != "string") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const stringEntry = this.doc.createElement("input");
                stringEntry.type = "text";
                stringEntry.required = true;
                stringEntry.className = "component-string-entry";
                stringEntry.value = value.value;
                stringEntry.onchange = () => {
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`)
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                        }
                        property.value.value.items[index].value = stringEntry.value;
                    } else {
                        property.value.value = stringEntry.value;
                    }
                    this.modifyEntity();
                };
                return stringEntry;
            }
            case "boolean": {
                if (typeof value.value != "boolean") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const booleanEntry = this.doc.createElement("input");
                booleanEntry.type = "checkbox";
                booleanEntry.className = "component-boolean-entry";
                booleanEntry.checked = value.value;
                booleanEntry.onchange = () => {
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`)
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                        }
                        property.value.value.items[index].value = booleanEntry.checked;
                    } else {
                        property.value.value = booleanEntry.checked;
                    }
                    this.modifyEntity();
                };
                return booleanEntry;
            }
            case "array": {
                if (!(value.value instanceof ValueList)) {
                    throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                }
                const items = value.value.items;
                const defaultValue = value.value.defaultValue;
                const arrayList = this.doc.createElement("ul");
                arrayList.className = "component-array";
                for (let i = 0; i < items.length; i++) {
                    const item = items[i] as Value;
                    const valueItem = this.doc.createElement("li");
                    valueItem.className = "component-array-item";
                    valueItem.appendChild(this.generateValueElements(component, property, item, i));
                    const removeItemButton = this.doc.createElement("button");
                    removeItemButton.className = "component-array-remove";
                    removeItemButton.innerText = "-";
                    valueItem.appendChild(removeItemButton);
                    arrayList.appendChild(valueItem);
                }
                const addItemButton = this.doc.createElement("button");
                addItemButton.className = "component-array-add";
                addItemButton.innerText = "+";
                addItemButton.onclick = () => {
                    if (!(value.value instanceof ValueList)) {
                        throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                    }
                    value.value.items.push(value.value.defaultValue.Copy());
                    this.modifyEntity();
                }
                arrayList.appendChild(addItemButton);
                return arrayList;
            }
            default: {
                if (!(value.value instanceof Array)) {
                    throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`)
                }
                const subpropertyList = this.doc.createElement("ul");
                subpropertyList.className = "selected-list";
                for (const subproperty of value.value as Property[]) {
                    const subpropertyItem = this.generatePropertyElements(component, subproperty);
                    subpropertyList.appendChild(subpropertyItem);
                }
                return subpropertyList;
            }
        }
    }

    private generatePropertyElements(component: Component, property: Property): HTMLElement {
        const propertyItem = this.doc.createElement("li");
        propertyItem.className = "component-property";
        const propertyTitle = this.doc.createElement("span");
        propertyTitle.className = "component-property-label";
        propertyTitle.innerText = property.name;
        propertyItem.appendChild(propertyTitle);
        if (property.optional) {
            const optionalEntry = this.doc.createElement("input");
            optionalEntry.type = "checkbox";
            optionalEntry.className = "component-optional";
            optionalEntry.checked = property.provided;
            optionalEntry.onchange = () => {
                property.provided = optionalEntry.checked;
                this.modifyEntity();
            };
            propertyItem.appendChild(optionalEntry);
            if (!property.provided) {
                return propertyItem;
            }
        }
        propertyItem.appendChild(this.generateValueElements(component, property, property.value))
        return propertyItem;
    }
}

export default SelectedBox;