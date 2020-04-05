import ProjectPicker from "./project_picker";

const projectPicker = new ProjectPicker();

const openProjectButton = document.getElementById("open-project-button");
if (openProjectButton === null) {
    throw("Failed to find 'Open Project' button");
}
openProjectButton.onclick = () => {
    projectPicker.OpenProject();
};