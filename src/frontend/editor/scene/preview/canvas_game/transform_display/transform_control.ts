import Component from "jamjar/lib/component/component";
import IEntity from "jamjar/lib/entity/ientity";
import TransformControlType from "./transform_control_type";

class TransformControl extends Component {
    public static readonly KEY = "transform_control";
    public type: TransformControlType;
    public controlTarget: IEntity;
    public selected: boolean;
    constructor(controlTarget: IEntity, type: TransformControlType, selected: boolean = false) {
        super(TransformControl.KEY);
        this.controlTarget = controlTarget;
        this.type = type;
        this.selected = selected;
    }
}

export default TransformControl;