import System from "jamjar/lib/system/system";
import Transform from "jamjar/lib/standard/transform/transform";
import JamJarEntity from "./jamjar_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import PreviewGame from "../preview_game";
import IMessage from "jamjar/lib/message/imessage";
import ComponentSpec from "../../../../../../shared/component_spec";
import Message from "jamjar/lib/message/message";
import Scene from "../../../../../../shared/scene";
import Entity from "jamjar/lib/entity/entity";
import Vector from "jamjar/lib/geometry/vector";
import Sprite from "jamjar/lib/standard/sprite/sprite";
import Material from "jamjar/lib/rendering/material";
import Polygon from "jamjar/lib/standard/shape/polygon";
import Texture from "jamjar/lib/rendering/texture";
import Property from "../../../../../../shared/property";
import Marker from "../marker/marker";

class JamJarEntityDisplaySystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [Transform.KEY, JamJarEntity.KEY].every((type) => components.some(
            component => component.key == type
        )) || [Transform.KEY, Marker.KEY].every((type) => components.some(
            component => component.key == type
        ));
    }

    private specs: Map<number, ComponentSpec>;

    constructor(messageBus: IMessageBus, 
        scene?: IScene | undefined, 
        specs: Map<number, ComponentSpec> = new Map(),
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined) {
        super(messageBus, scene, JamJarEntityDisplaySystem.EVALUATOR, entities, subscriberID);
        this.specs = specs;
        this.messageBus.Subscribe(this, [PreviewGame.MESSAGE_LOAD_SPECS, PreviewGame.MESSAGE_LOAD_SCENE]);
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
            case PreviewGame.MESSAGE_LOAD_SCENE: {
                const loadSceneMessage = message as Message<Scene>;
                if (loadSceneMessage.payload === undefined) {
                    return;
                }
                for (const entity of this.entities.values()) {
                    entity.Destroy();
                }
                for (const loadedEntity of loadSceneMessage.payload.entities) {
                    const entityRepresentation = new Entity(this.messageBus);
                    for (const entityComponent of loadedEntity.components) {
                        const spec = this.specs.get(entityComponent.specID);
                        if (spec === undefined) {
                            continue;
                        }
                        if (spec.name !== "Transform" || spec.path !== "jamjar/lib/standard/transform/transform") {
                            continue;
                        }
                        const positionProperty = entityComponent.properties[0];
                        let positionVector = new Vector(0,0);
                        if (!positionProperty.optional || positionProperty.provided) {
                            positionVector = new Vector(
                                (positionProperty.value.value as Property[])[0].value.value as number,
                                (positionProperty.value.value as Property[])[1].value.value as number
                            );
                        }
                        const scaleProperty = entityComponent.properties[1];
                        let scaleVector = new Vector(1,1);
                        if (!scaleProperty.optional || scaleProperty.provided) {
                            scaleVector = new Vector(
                                (scaleProperty.value.value as Property[])[0].value.value as number,
                                (scaleProperty.value.value as Property[])[1].value.value as number
                            );
                        }
                        const angleProperty = entityComponent.properties[2];
                        let angleScalar = 0;
                        if (!angleProperty.optional || angleProperty.provided) {
                            angleScalar = angleProperty.value.value as number;
                        }
                        entityRepresentation.Add(new Transform(positionVector, scaleVector, angleScalar));
                        
                        const rotateArrow = new Entity(this.messageBus);
                        rotateArrow.Add(new Transform(new Vector(positionVector.x, positionVector.y + scaleVector.y * 2), new Vector(scaleVector.x, scaleVector.y)));
                        rotateArrow.Add(new Sprite(new Material(
                            new Texture("rotate_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
                        ), 0));
                        rotateArrow.Add(new Marker());
                        if (this.scene !== undefined) {
                            this.scene.AddEntity(rotateArrow);
                        }                
                        const xDirArrow = new Entity(this.messageBus);
                        xDirArrow.Add(new Transform(new Vector(positionVector.x + scaleVector.x, positionVector.y), new Vector(scaleVector.x, scaleVector.y), Math.PI/2));
                        xDirArrow.Add(new Sprite(new Material(
                            new Texture("x_dir_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
                        ), 0));
                        xDirArrow.Add(new Marker());
                        if (this.scene !== undefined) {
                            this.scene.AddEntity(xDirArrow);
                        }                
                        const yDirArrow = new Entity(this.messageBus);
                        yDirArrow.Add(new Transform(new Vector(positionVector.x, positionVector.y + scaleVector.y), new Vector(scaleVector.x, scaleVector.y)));
                        yDirArrow.Add(new Sprite(new Material(
                            new Texture("y_dir_arrow", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
                        ), 0));
                        yDirArrow.Add(new Marker());
                        if (this.scene !== undefined) {
                            this.scene.AddEntity(yDirArrow);
                        }
                    }
                    entityRepresentation.Add(new Sprite(new Material(
                        new Texture("selected", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
                    ), 0));
                    entityRepresentation.Add(new JamJarEntity(loadedEntity.id, loadedEntity));
                    if (this.scene !== undefined) {
                        this.scene.AddEntity(entityRepresentation);
                    }
                }
                break;
            }
        }
    }

}

export default JamJarEntityDisplaySystem;