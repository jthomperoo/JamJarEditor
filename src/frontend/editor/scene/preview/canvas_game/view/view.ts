import Component from "jamjar/lib/component/component";

class View extends Component {
    public static readonly KEY = "view";
    public zoomLevel: number;
    constructor(zoomLevel: number) {
        super(View.KEY);
        this.zoomLevel = zoomLevel;
    }
}

export default View;