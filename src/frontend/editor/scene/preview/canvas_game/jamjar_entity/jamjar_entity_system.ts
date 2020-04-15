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
import Vector from "jamjar/lib/geometry/vector";
import EntityDefinition from "../../../../../../shared/entity";
import Property from "../../../../../../shared/property";
import Entity from "jamjar/lib/entity/entity";
import Material from "jamjar/lib/rendering/material";
import Texture from "jamjar/lib/rendering/texture";
import Polygon from "jamjar/lib/standard/shape/polygon";
import Sprite from "jamjar/lib/standard/sprite/sprite";

class JamJarEntitySystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [JamJarEntity.KEY].every((type) => components.some(
            component => component.key == type
        ));
    }

    private specs: Map<number, ComponentSpec>;

    constructor(messageBus: IMessageBus, 
        scene?: IScene | undefined, 
        specs: Map<number, ComponentSpec> = new Map(),
        entities?: Map<number, SystemEntity> | undefined, 
        subscriberID?: number | undefined) {
        super(messageBus, scene, JamJarEntitySystem.EVALUATOR, entities, subscriberID);
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
                    // Get definition
                    const jamjarEntity = entity.Get(JamJarEntity.KEY) as JamJarEntity;
                    let entityDefinition: EntityDefinition | undefined = undefined;
                    for (const definition of loadSceneMessage.payload.entities) {
                        if (definition.id === jamjarEntity.id) {
                            entityDefinition = definition;
                            break;
                        }
                    }
    
                    // Remove if no definition
                    if (entityDefinition === undefined) {
                        entity.Destroy();
                        continue;
                    }

                    // Update existing
                    jamjarEntity.entity = entityDefinition;
                    for (const entityComponent of entityDefinition.components) {
                        const spec = this.specs.get(entityComponent.specID);
                        if (spec === undefined) {
                            continue;
                        }
                        if (spec.name !== "Transform" || spec.path !== "jamjar/lib/standard/transform/transform") {
                            continue;
                        }

                        let transform = entity.Get(Transform.KEY) as Transform;
                        if (transform === undefined) {
                            transform = new Transform();
                            entity.Add(transform);
                        }

                        // Determine position
                        const positionProperty = entityComponent.properties[0];
                        let positionVector = new Vector(0,0);
                        if (!positionProperty.optional || positionProperty.provided) {
                            positionVector = new Vector(
                                (positionProperty.value.value as Property[])[0].value.value as number,
                                (positionProperty.value.value as Property[])[1].value.value as number
                            );
                        }

                        // Determine scale
                        const scaleProperty = entityComponent.properties[1];
                        let scaleVector = new Vector(1,1);
                        if (!scaleProperty.optional || scaleProperty.provided) {
                            scaleVector = new Vector(
                                (scaleProperty.value.value as Property[])[0].value.value as number,
                                (scaleProperty.value.value as Property[])[1].value.value as number
                            );
                        }

                        // Determine angle
                        const angleProperty = entityComponent.properties[2];
                        let angleScalar = 0;
                        if (!angleProperty.optional || angleProperty.provided) {
                            angleScalar = angleProperty.value.value as number;
                        }

                        transform.position = positionVector;
                        transform.scale = scaleVector;
                        transform.angle = angleScalar;
                    }
                }
                for (const definition of loadSceneMessage.payload.entities) {
                    let alreadyExists = false;
                    for (const entity of this.entities.values()) {
                        const jamjarEntity = entity.Get(JamJarEntity.KEY) as JamJarEntity;
                        if (definition.id === jamjarEntity.id) {
                            alreadyExists = true;
                            break;
                        }
                    }
                    if (alreadyExists) {
                        continue;
                    }
                    // Add new
                    const entity = new Entity(this.messageBus);
                    for (const entityComponent of definition.components) {
                        const spec = this.specs.get(entityComponent.specID);
                        if (spec === undefined) {
                            continue;
                        }
                        if (spec.name !== "Transform" || spec.path !== "jamjar/lib/standard/transform/transform") {
                            continue;
                        }

                        // Determine position
                        const positionProperty = entityComponent.properties[0];
                        let positionVector = new Vector(0,0);
                        if (!positionProperty.optional || positionProperty.provided) {
                            positionVector = new Vector(
                                (positionProperty.value.value as Property[])[0].value.value as number,
                                (positionProperty.value.value as Property[])[1].value.value as number
                            );
                        }

                        // Determine scale
                        const scaleProperty = entityComponent.properties[1];
                        let scaleVector = new Vector(1,1);
                        if (!scaleProperty.optional || scaleProperty.provided) {
                            scaleVector = new Vector(
                                (scaleProperty.value.value as Property[])[0].value.value as number,
                                (scaleProperty.value.value as Property[])[1].value.value as number
                            );
                        }

                        // Determine angle
                        const angleProperty = entityComponent.properties[2];
                        let angleScalar = 0;
                        if (!angleProperty.optional || angleProperty.provided) {
                            angleScalar = angleProperty.value.value as number;
                        }

                        entity.Add(new Transform(
                            positionVector,
                            scaleVector,
                            angleScalar
                        ));
                    }
                    entity.Add(new JamJarEntity(definition.id, definition));
                    entity.Add(new Sprite(new Material(
                        new Texture("selected", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
                    ), 0));
                    if (this.scene !== undefined) {
                        this.scene.AddEntity(entity);
                    }
                }
                break;
            }
        }
    }
}

export default JamJarEntitySystem;