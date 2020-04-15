import System from "jamjar/lib/system/system";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import PreviewGame from "../preview_game";
import IMessage from "jamjar/lib/message/imessage";
import Message from "jamjar/lib/message/message";
import Selected from "./selected";
import JamJarEntity from "../jamjar_entity/jamjar_entity";

class SelectedSystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [JamJarEntity.KEY].every((type) => components.some(
            component => component.key == type
        ));
    }

    constructor(messageBus: IMessageBus, 
        scene?: IScene | undefined, 
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined) {
        super(messageBus, scene, SelectedSystem.EVALUATOR, entities, subscriberID);
        this.messageBus.Subscribe(this, [PreviewGame.MESSAGE_SELECT_ENTITY]);
    }

    public OnMessage(message: IMessage): void {
        super.OnMessage(message);
        switch(message.type) {
            case PreviewGame.MESSAGE_SELECT_ENTITY: {
                const selectEntityMessage = message as Message<number>;
                if (selectEntityMessage.payload === undefined) {
                    return;
                }
                const entityID = selectEntityMessage.payload;
                for (const entity of this.entities.values()) {
                    const entityDefinition = entity.Get(JamJarEntity.KEY) as JamJarEntity;
                    if (entityDefinition.id !== entityID) {
                        entity.Remove(Selected.KEY);
                        continue;
                    }
                    entity.Add(new Selected());
                }
                break;
            }
        }
    }
}

export default SelectedSystem;