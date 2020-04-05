import ComponentBox from "./scene/component_box/component_box";
import Preview from "./scene/preview/preview";
import SelectedBox from "./scene/selected_box/selected_box";
import EntitiesBox from "./scene/entities_box/entites_box";
import Scene from "../../shared/scene";
import SceneEdit from "./scene/scene_edit";
import Messages from "../../shared/messages";

const previewElement = document.getElementById("preview");

if (previewElement === null) {
    throw("Unable to find preview element");
}

const selectedElement = document.getElementById("selected");

if (selectedElement === null) {
    throw("Unable to find selected box element");
}

const entitiesElement = document.getElementById("entities");

if (entitiesElement === null) {
    throw("Unable to find entities box element");
}

const componentElement = document.getElementById("components");

if (componentElement === null) {
    throw("Unable to find component box element");
}

let sceneEdit: SceneEdit | undefined = undefined;
const openScene = (scene?: Scene) => {
    if (sceneEdit !== undefined) {
        // Close any existing scene
        sceneEdit.Close();
    }
    const componentBox = new ComponentBox(componentElement);
    const preview = new Preview(previewElement);
    const selectedBox = new SelectedBox(selectedElement);
    const entitiesBox = new EntitiesBox(entitiesElement);

    sceneEdit = new SceneEdit(componentBox, entitiesBox, selectedBox, preview, scene);
    sceneEdit.Start();
};

window.ipcRenderer.on(Messages.START_EDITOR, (event: any) => {
    openScene();
    window.ipcRenderer.send(Messages.FINISH_EDITOR_START);
});

window.ipcRenderer.on(Messages.OPEN_SCENE, (event: any, sceneJSON: any) => {
    const scene = Scene.Unmarshal(sceneJSON);
    openScene(scene);
});