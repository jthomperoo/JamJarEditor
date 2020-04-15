import System from "jamjar/lib/system/system";
import Transform from "jamjar/lib/standard/transform/transform";
import JamJarEntity from "../jamjar_entity/jamjar_entity";
import IEntity from "jamjar/lib/entity/ientity";
import Component from "jamjar/lib/component/component";
import IMessageBus from "jamjar/lib/message/imessage_bus";
import IScene from "jamjar/lib/scene/iscene";
import SystemEntity from "jamjar/lib/system/system_entity";
import Selected from "../selected/selected";
import Sprite from "jamjar/lib/standard/sprite/sprite";
import TransformControl from "./transform_control";
import TransformControlType from "./transform_control_type";
import Vector from "jamjar/lib/geometry/vector";
import Entity from "jamjar/lib/entity/entity";
import Material from "jamjar/lib/rendering/material";
import Texture from "jamjar/lib/rendering/texture";
import Polygon from "jamjar/lib/standard/shape/polygon";
import IMessage from "jamjar/lib/message/imessage";
import Message from "jamjar/lib/message/message";
import Pointer from "jamjar/lib/standard/pointer/pointer";
import ComponentSpec from "../../../../../../shared/component_spec";
import PreviewGame from "../preview_game";
import Property from "../../../../../../shared/property";
import EditorSystem from "../editor/editor_system";

class TransformDisplaySystem extends System {
    public static readonly EVALUATOR = (entity: IEntity, components: Component[]): boolean => {
        return [Transform.KEY, JamJarEntity.KEY, Selected.KEY].every((type) => components.some(
            component => component.key == type
        )) || [Transform.KEY, Sprite.KEY, TransformControl.KEY].every((type) => components.some(
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
        this.messageBus.Subscribe(this, [PreviewGame.MESSAGE_LOAD_SPECS, "pointerdown", "pointerup", "pointermove"])
    }

    public OnMessage(message: IMessage): void {
        super.OnMessage(message);
        switch (message.type) {
            case PreviewGame.MESSAGE_LOAD_SPECS: {
                const loadSpecsMessage = message as Message<Map<number, ComponentSpec>>;
                if (loadSpecsMessage.payload === undefined) {
                    return;
                }
                this.specs = loadSpecsMessage.payload;
                break;
            }
            case "pointerdown": {
                const pointerMessage = message as Message<Pointer>;
                if (pointerMessage.payload === undefined) {
                    return;
                }
                if (pointerMessage.payload.cameraInfos.length <= 0) {
                    return;
                }
                const pointerPos = pointerMessage.payload.cameraInfos[0].worldPosition;
                const transformMarkers = [...this.entities.values()].filter((entity) => {
                    return entity.Get(TransformControl.KEY) && entity.Get(Sprite.KEY);
                });
                console.log(pointerPos);
                for (const transformMarker of transformMarkers) {
                    const markerTransform = transformMarker.Get(Transform.KEY) as Transform;
                    const markerSprite = transformMarker.Get(Sprite.KEY) as Sprite;
                    
                    if (markerSprite.bounds.Transform(markerTransform).PointInside(pointerPos)) {
                        const markerControl = transformMarker.Get(TransformControl.KEY) as TransformControl;
                        console.log("SELECT");
                        markerControl.selected = true;
                    }
                }
                break;
            }
            case "pointerup": {
                const pointerMessage = message as Message<Pointer>;
                if (pointerMessage.payload === undefined) {
                    return;
                }
                const transformMarkers = [...this.entities.values()].filter((entity) => {
                    return entity.Get(TransformControl.KEY) && entity.Get(Sprite.KEY);
                });
                let updateRequired = false;
                for (const transformMarker of transformMarkers) {
                    const markerControl = transformMarker.Get(TransformControl.KEY) as TransformControl;
                    if (markerControl.selected) {
                        updateRequired = true;
                    }
                    markerControl.selected = false;
                }
                if (updateRequired) {
                    this.messageBus.Publish(new Message(EditorSystem.MESSAGE_MODIFY_ENTITY));
                }
                break;
            }
            case "pointermove": {
                const pointerMessage = message as Message<Pointer>;
                if (pointerMessage.payload === undefined) {
                    return;
                }
                const pointerPos = pointerMessage.payload.cameraInfos[0].worldPosition;
                const transformMarkers = [...this.entities.values()].filter((entity) => {
                    return entity.Get(TransformControl.KEY) && entity.Get(Sprite.KEY);
                });
                for (const transformMarker of transformMarkers) {
                    const markerControl = transformMarker.Get(TransformControl.KEY) as TransformControl;
                    if (markerControl.selected === true) {
                        const target = this.entities.get(markerControl.controlTarget.id);
                        if (target === undefined) {
                            continue;
                        }
                        const targetDefinition = target.Get(JamJarEntity.KEY) as JamJarEntity;
                        for (const entityComponent of targetDefinition.entity.components) {
                            const spec = this.specs.get(entityComponent.specID);
                            if (spec === undefined) {
                                continue;
                            }
                            if (spec.name !== "Transform" || spec.path !== "jamjar/lib/standard/transform/transform") {
                                continue;
                            }

                            switch (markerControl.type) {
                                case TransformControlType.TranslateWorldX: {
                                    const positionProperty = entityComponent.properties[0];
                                    (positionProperty.value.value as Property[])[0].value.value = pointerPos.x;
                                    break;
                                }
                                case TransformControlType.TranslateWorldY: {
                                    const positionProperty = entityComponent.properties[0];
                                    (positionProperty.value.value as Property[])[1].value.value = pointerPos.y;
                                    break;
                                }
                                case TransformControlType.Rotate: {
                                    break;
                                }
                                default: {
                                    throw(`Unknown transform control type '${markerControl.type}'`)
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    public Update(): void {
        const transformMarkers = [...this.entities.values()].filter((entity) => {
            return entity.Get(TransformControl.KEY) && entity.Get(Sprite.KEY);
        });
        for (const entity of transformMarkers) {
            const transformControl = entity.Get(TransformControl.KEY) as TransformControl;
            const target = this.entities.get(transformControl.controlTarget.id);
            // Delete if not selected
            if (target === undefined) {
                entity.Destroy();
                continue;
            }
            // Update existing selected
            const targetTransform = target.Get(Transform.KEY) as Transform;
            const transform = entity.Get(Transform.KEY) as Transform;
            switch (transformControl.type) {
                case TransformControlType.TranslateWorldX: {
                    transform.position = new Vector(targetTransform.position.x + targetTransform.scale.x, targetTransform.position.y);
                    transform.scale = new Vector(targetTransform.scale.y, targetTransform.scale.y);
                    break;
                }
                case TransformControlType.TranslateWorldY: {
                    transform.position = new Vector(targetTransform.position.x, targetTransform.position.y  + targetTransform.scale.y);
                    transform.scale = new Vector(targetTransform.scale.x, targetTransform.scale.x);
                    break;
                }
                case TransformControlType.Rotate: {
                    transform.position = new Vector(targetTransform.position.x, targetTransform.position.y  + targetTransform.scale.y * 2);
                    transform.scale = new Vector(targetTransform.scale.x, targetTransform.scale.x);
                    break;
                }
                default: {
                    throw(`Unknown transform control type '${transformControl.type}'`)
                }
            }
        }

        const selectedEntities = [...this.entities.values()].filter((entity) => {
            return entity.Get(JamJarEntity.KEY) && entity.Get(Selected.KEY);
        });
        for (const entity of selectedEntities) {
            let alreadyExists = false;
            for (const control of transformMarkers) {
                const transformControl = control.Get(TransformControl.KEY) as TransformControl;
                if (transformControl.controlTarget.id === entity.entity.id) {
                    alreadyExists = true;
                    break;
                }
            }
            if (alreadyExists) {
                continue;
            }
            const targetTransform = entity.Get(Transform.KEY) as Transform;

            // Translate X
            const translateXEntity = new Entity(this.messageBus);
            translateXEntity.Add(new Transform(
                new Vector(targetTransform.position.x + targetTransform.scale.x, targetTransform.position.y),
                new Vector(targetTransform.scale.y, targetTransform.scale.y),
                Math.PI/2
            ));
            translateXEntity.Add(new TransformControl(entity.entity, TransformControlType.TranslateWorldX));
            translateXEntity.Add(new Sprite(new Material(
                new Texture("translate_x", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
            ), 0));     
            
            // Translate Y
            const translateYEntity = new Entity(this.messageBus);
            translateYEntity.Add(new Transform(
                new Vector(targetTransform.position.x, targetTransform.position.y + targetTransform.scale.y),
                new Vector(targetTransform.scale.x, targetTransform.scale.x)
            ));
            translateYEntity.Add(new TransformControl(entity.entity, TransformControlType.TranslateWorldY));
            translateYEntity.Add(new Sprite(new Material(
                new Texture("translate_y", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
            ), 0));  
            
            // Rotate
            const rotateEntity = new Entity(this.messageBus);
            rotateEntity.Add(new Transform(
                new Vector(targetTransform.position.x, targetTransform.position.y + targetTransform.scale.y * 2),
                new Vector(targetTransform.scale.x, targetTransform.scale.x)
            ));
            rotateEntity.Add(new TransformControl(entity.entity, TransformControlType.Rotate));
            rotateEntity.Add(new Sprite(new Material(
                new Texture("rotate", Polygon.RectangleByPoints(new Vector(0,0), new Vector(1,1)).GetFloat32Array())
            ), 0));   
        }
    }

}

export default TransformDisplaySystem;