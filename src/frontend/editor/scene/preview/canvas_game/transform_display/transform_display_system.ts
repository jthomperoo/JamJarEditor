import System from "jamjar/lib/system/system";
import Transform from "jamjar/lib/standard/transform/transform";
import JamJarEntity from "../jamjar_entity/jamjar_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import PreviewGame from "../preview_game";
import IMessage from "jamjar/lib/message/imessage";
import ComponentSpec from "../../../../../../shared/component_spec";
import Message from "jamjar/lib/message/message";
import Vector from "jamjar/lib/geometry/vector";
import Property from "../../../../../../shared/property";
import Selected from "../selected/selected";

class TransformDisplaySystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [Transform.KEY, JamJarEntity.KEY].every((type) => components.some(
            component => component.key == type
        ));
    }

    private specs: Map<number, ComponentSpec>;

    constructor(messageBus: IMessageBus, 
        scene?: IScene | undefined, 
        specs: Map<number, ComponentSpec> = new Map(),
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined) {
        super(messageBus, scene, TransformDisplaySystem.EVALUATOR, entities, subscriberID);
        this.specs = specs;
        this.messageBus.Subscribe(this, PreviewGame.MESSAGE_LOAD_SPECS);
    }

    public OnMessage(message: IMessage): void {
        super.OnMessage(message);
        switch(message.type) {
            case PreviewGame.MESSAGE_LOAD_SPECS: {
                const loadSpecsMessage = message as Message<Map<number, ComponentSpec>>;
                if (loadSpecsMessage.payload === undefined) {
                    return;
                }
                this.specs = loadSpecsMessage.payload;
                break;
            }
        }
    }
}

export default TransformDisplaySystem;