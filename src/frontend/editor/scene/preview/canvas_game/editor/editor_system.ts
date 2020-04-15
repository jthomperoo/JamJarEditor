import System from "jamjar/lib/system/system";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import PreviewGame from "../preview_game";
import IMessage from "jamjar/lib/message/imessage";
import Message from "jamjar/lib/message/message";
import JamJarEntity from "../jamjar_entity/jamjar_entity";
import Preview from "../../preview";

class EditorSystem extends System {

    public static readonly MESSAGE_MODIFY_ENTITY = "modify_entity";

    private preview: Preview;

    constructor(messageBus: IMessageBus, 
        preview: Preview,
        scene?: IScene | undefined, 
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined) {
        super(messageBus, scene, undefined, entities, subscriberID);
        this.messageBus.Subscribe(this, [PreviewGame.MESSAGE_SELECT_ENTITY]);
        this.preview = preview;
    }

    public OnMessage(message: IMessage): void {
        super.OnMessage(message);
        switch(message.type) {
            case EditorSystem.MESSAGE_MODIFY_ENTITY: {
                this.preview.ModifyEntity()
                break;
            }
        }
    }
}

export default EditorSystem;