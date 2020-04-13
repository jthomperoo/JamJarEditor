import Component from "jamjar/lib/component/component";
import Entity from "../../../../../../shared/entity";

class JamJarEntity extends Component {
    public static readonly KEY = "jamjar_entity";
    public id: number;
    public entity: Entity;
    constructor(id: number, entity: Entity) {
        super(JamJarEntity.KEY);
        this.id = id;
        this.entity = entity;
    }
}

export default JamJarEntity;