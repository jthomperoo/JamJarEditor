import Component from "jamjar/lib/component/component";

class ResizableCamera extends Component {
    public static readonly KEY = "resizable_camera";
    public zoomLevel: number;
    constructor(zoomLevel: number) {
        super(ResizableCamera.KEY);
        this.zoomLevel = zoomLevel;
    }
}

export default ResizableCamera;