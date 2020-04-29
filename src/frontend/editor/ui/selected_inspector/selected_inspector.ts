/*
Copyright 2020 JamJar Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import Entity from "../../../../shared/data/entity";
import Component from "../../../../shared/data/component";
import Property from "../../../../shared/data/property";
import Value from "../../../../shared/data/value";
import ValueList from "../../../../shared/data/value_list";
import UIElement from "../ui_element";
import SceneState from "../../../../shared/scene_state/scene_state";
import SelectedState from "../../selected_state/selected_state";
import SceneControl from "../../scene_control/scene_control";

class SelectedInspector extends UIElement {

    private sceneState: SceneState;
    private selectedState: SelectedState;

    constructor(element: HTMLElement,
        sceneState: SceneState, 
        selectedState: SelectedState, 
        sceneControl: SceneControl,
        doc?: HTMLDocument) {
        super(element, sceneControl, doc);
        this.sceneState = sceneState;
        this.selectedState = selectedState;
    }

    private syncStateSelected(): void {
        const selected = this.selectedState.GetSelected();
        if (selected === undefined) {
            return;
        }
        const scene = this.sceneState.GetScene();
        if (scene === undefined) {
            return;
        }
        for (let i = 0; i < scene.entities.length; i++) {
            const entity = scene.entities[i];
            if (entity.id !== selected.id) {
                continue;
            }
            scene.entities[i] = selected;
        }
        this.sceneState.SetScene(scene);
        this.sceneControl.Update();
    }

    public Update(): void {
        while (this.element.firstChild !== null) {
            this.element.firstChild.remove();
        }

        const selected = this.selectedState.GetSelected();

        if (selected === undefined) {
            const title = this.doc.createElement("span");
            title.id = "selected-entity-name";
            title.innerText = "None Selected";
            this.element.appendChild(title);
            return;
        }
        
        const scene = this.sceneState.GetScene();
        const specs = this.sceneState.GetSpecMap();
        
        const title = this.doc.createElement("input");
        title.id = "selected-entity-name";
        title.type = "text";
        title.value = selected.name;
        title.onchange = (): void => {
            if (selected === undefined) {
                return;
            }
            if (scene === undefined) {
                return;
            }
            selected.name = title.value;
            this.selectedState.SetSelected(selected);
            this.syncStateSelected();
            this.sceneControl.Update();
        };
        this.element.appendChild(title);
        
        const componentList = this.doc.createElement("ul");
        componentList.id = "selected-components";
        componentList.className = "item-list";
        for (const component of selected.components) {
            const spec = specs.get(component.specID);
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
            componentDeleteButton.onclick = (): void => {
                if (selected === undefined) {
                    return;
                }
                if (scene === undefined) {
                    return;
                }
                for (let i = 0; i < selected.components.length; i++) {
                    if (component.id === selected.components[i].id) {
                        selected.components.splice(i, 1);
                    }
                }
                this.selectedState.SetSelected(selected);
                this.syncStateSelected();
                this.sceneControl.Update();
            };
            componentItem.appendChild(componentDeleteButton);

            // Properties
            const propertyList = this.doc.createElement("ul");
            propertyList.className = "selected-list";
            for (const property of component.properties) {
                const propertyItem = this.generatePropertyElements(selected, component, property);
                propertyList.appendChild(propertyItem);
            }
            componentItem.appendChild(propertyList);

            componentList.appendChild(componentItem);
        }
        this.element.appendChild(componentList);
    }

    private generateValueElements(selected: Entity, component: Component, property: Property, value: Value, index?: number): HTMLElement {
        switch(value.type) {
            case "number": {
                if (typeof value.value !== "number") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const numberEntry = this.doc.createElement("input");
                numberEntry.type = "number";
                numberEntry.required = true;
                numberEntry.className = "component-number-entry";
                numberEntry.step = "any";
                numberEntry.value = value.value.toString();
                numberEntry.onchange = (): void => {
                    const val = parseFloat(numberEntry.value);
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`);
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                        }
                        property.value.value.items[index].value = val;
                    } else {
                        property.value.value = val;
                    }
                    this.selectedState.SetSelected(selected);
                    this.syncStateSelected();
                    this.sceneControl.Update();
                };
                return numberEntry;
            }
            case "string": {
                if (typeof value.value !== "string") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const stringEntry = this.doc.createElement("input");
                stringEntry.type = "text";
                stringEntry.required = true;
                stringEntry.className = "component-string-entry";
                stringEntry.value = value.value;
                stringEntry.onchange = (): void => {
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`);
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                        }
                        property.value.value.items[index].value = stringEntry.value;
                    } else {
                        property.value.value = stringEntry.value;
                    }
                    this.selectedState.SetSelected(selected);
                    this.syncStateSelected();
                    this.sceneControl.Update();
                };
                return stringEntry;
            }
            case "boolean": {
                if (typeof value.value !== "boolean") {
                    throw(`Invalid property ${property.name}, expected type ${value.type}, got ${typeof value.value}`);
                }
                const booleanEntry = this.doc.createElement("input");
                booleanEntry.type = "checkbox";
                booleanEntry.className = "component-boolean-entry";
                booleanEntry.checked = value.value;
                booleanEntry.onchange = (): void => {
                    if (property.value.type === "array") {
                        if (index === undefined) {
                            throw(`No index provided for array value in property ${property.name}.`);
                        }
                        if (!(property.value.value instanceof ValueList)) {
                            throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                        }
                        property.value.value.items[index].value = booleanEntry.checked;
                    } else {
                        property.value.value = booleanEntry.checked;
                    }
                    this.selectedState.SetSelected(selected);
                    this.syncStateSelected();
                    this.sceneControl.Update();
                };
                return booleanEntry;
            }
            case "array": {
                if (!(value.value instanceof ValueList)) {
                    throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                }
                const items = value.value.items;
                const defaultValue = value.value.defaultValue;
                const arrayList = this.doc.createElement("ul");
                arrayList.className = "component-array";
                for (let i = 0; i < items.length; i++) {
                    const item = items[i] as Value;
                    const valueItem = this.doc.createElement("li");
                    valueItem.className = "component-array-item";
                    valueItem.appendChild(this.generateValueElements(selected, component, property, item, i));
                    const removeItemButton = this.doc.createElement("button");
                    removeItemButton.className = "component-array-remove";
                    removeItemButton.innerText = "-";
                    valueItem.appendChild(removeItemButton);
                    arrayList.appendChild(valueItem);
                }
                const addItemButton = this.doc.createElement("button");
                addItemButton.className = "component-array-add";
                addItemButton.innerText = "+";
                addItemButton.onclick = (): void => {
                    if (!(value.value instanceof ValueList)) {
                        throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                    }
                    value.value.items.push(value.value.defaultValue.Copy());
                    this.selectedState.SetSelected(selected);
                    this.syncStateSelected();
                    this.sceneControl.Update();
                };
                arrayList.appendChild(addItemButton);
                return arrayList;
            }
            default: {
                if (!(value.value instanceof Array)) {
                    throw(`Invalid type, expected ${value.type}, got ${typeof value.value}`);
                }
                const subpropertyList = this.doc.createElement("ul");
                subpropertyList.className = "selected-list";
                for (const subproperty of value.value as Property[]) {
                    const subpropertyItem = this.generatePropertyElements(selected, component, subproperty);
                    subpropertyList.appendChild(subpropertyItem);
                }
                return subpropertyList;
            }
        }
    }

    private generatePropertyElements(selected: Entity, component: Component, property: Property): HTMLElement {
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
            optionalEntry.onchange = (): void => {
                property.provided = optionalEntry.checked;
                this.selectedState.SetSelected(selected);
                this.syncStateSelected();
                this.sceneControl.Update();
            };
            propertyItem.appendChild(optionalEntry);
            if (!property.provided) {
                return propertyItem;
            }
        }
        propertyItem.appendChild(this.generateValueElements(selected, component, property, property.value));
        return propertyItem;
    }
}

export default SelectedInspector;