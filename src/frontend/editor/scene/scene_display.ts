import SceneEdit from "./scene_edit";

abstract class SceneDisplay {

    protected element: HTMLElement;
    protected sceneEdit?: SceneEdit;
    protected doc: HTMLDocument;

    constructor(element: HTMLElement, sceneEdit?: SceneEdit, doc: HTMLDocument = document) {
        this.element = element;
        this.sceneEdit = sceneEdit;
        this.doc = doc;
    }

    public SetSceneEdit(sceneEdit: SceneEdit): void {
        this.sceneEdit = sceneEdit;
    }

}

export default SceneDisplay;