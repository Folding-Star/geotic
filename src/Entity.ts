import {Component, type ComponentType} from './Component';
import { EntityEvent } from './EntityEvent.js';
import { addBit, hasBit, subtractBit } from './util/bit-util';
import type {World} from "./World";
import type {ComponentClass, ComponentProperties, EntityId, SerializedEntity} from "./types/basic-types";

export type EntityType = Entity & Record<string, any>

const attachComponent = (entity: EntityType, component: Component) => {
    const key = component._ckey;

    entity[key] = component;
    entity.components[key] = component;
};

const attachComponentKeyed = (entity: EntityType, component: ComponentType) => {
    const key = component._ckey;

    if (!entity.components[key]) {
        entity[key] = {};
        entity.components[key] = {};
    }

    entity[key][component[component.keyProperty]] = component;
    (entity.components[key] as { [key: string]: Component })[component[component.keyProperty]] = component;
};

const attachComponentArray = (entity: EntityType, component: Component) => {
    const key = component._ckey;

    if (!entity.components[key]) {
        entity[key] = [];
        entity.components[key] = [];
    }

    entity[key].push(component);
    (entity.components[key] as Component[]).push(component);
};

const removeComponent = (entity: EntityType, component: Component) => {
    component._onBeforeDestroyed(entity)
    const key = component._ckey;

    delete entity[key];
    delete entity.components[key];

    entity._cbits = subtractBit(entity._cbits, component._cbit);
    entity._candidacy();
};

const removeComponentKeyed = (entity: EntityType, component: ComponentType) => {
    component._onBeforeDestroyed(entity)
    const key = component._ckey;
    const keyProp = component[component.keyProperty];

    delete entity[key][keyProp];
    const examinedComponents = entity.components[key] as { [key: string]: Component };
    delete examinedComponents[keyProp];

    if (Object.keys(entity[key]).length <= 0) {
        delete entity[key];
        delete entity.components[key];
        entity._cbits = subtractBit(entity._cbits, component._cbit);
        entity._candidacy();
    }
};

const removeComponentArray = (entity: EntityType, component: Component) => {
    component._onBeforeDestroyed(entity)
    const key = component._ckey;
    const idx = entity[key].indexOf(component);

    entity[key].splice(idx, 1);
    const examinedComponents = entity.components[key]
    if (!Array.isArray(examinedComponents)) {
        throw new Error("Components are not in an arary.")
    }
    examinedComponents.splice(idx, 1);

    if (entity[key].length <= 0) {
        delete entity[key];
        delete entity.components[key];
        entity._cbits = subtractBit(entity._cbits, component._cbit);
        entity._candidacy();
    }
};

const serializeComponent = (component: Component) => {
    return component.serialize();
};

const serializeComponentArray = (arr: Component[]) => {
    return arr.map(serializeComponent);
};

const serializeComponentKeyed = (ob: { [key: string]: Component }) => {
    const ser: ComponentProperties = {};

    for (const k in ob) {
        ser[k] = serializeComponent(ob[k]);
    }

    return ser;
};

export class Entity {
    public _cbits: bigint = 0n;
    public _qeligible = true;

    world: World
    id: EntityId
    components: Record<string, Component | { [key: string] : Component } | Component[]>
    isDestroyed: boolean = false;

    constructor(world: World, id: EntityId) {
        this.world = world;
        this.id = id;
        this.components = {};
        this.isDestroyed = false;
    }

    _candidacy() {
        if (this._qeligible) {
            this.world._candidate(this);
        }
    }

    add(clazz: ComponentClass, properties: ComponentProperties) {
        const component = new clazz(properties);

        if (component.keyProperty) {
            attachComponentKeyed(this, component);
        } else if (component.allowMultiple) {
            attachComponentArray(this, component);
        } else {
            attachComponent(this, component);
        }

        this._cbits = addBit(this._cbits, component._cbit);
        component._onAttached(this);

        this._candidacy();
    }

    has(clazz: ComponentClass): boolean {
        return hasBit(this._cbits, clazz.prototype._cbit);
    }

    remove(component: Component) {
        if (component.keyProperty) {
            removeComponentKeyed(this, component);
        } else if (component.allowMultiple) {
            removeComponentArray(this, component);
        } else {
            removeComponent(this, component);
        }

        component._onDestroyed();
    }

    destroy() {
        for (const k in this.components) {
            const v = this.components[k];

            if (v instanceof Component) {
                v._onBeforeDestroyed(this)
            } else if (v instanceof Array) {
                for (const component of v) {
                    component._onBeforeDestroyed(this)
                }
            } else {
                for (const component of Object.values(v)) {
                    component._onBeforeDestroyed(this)
                }
            }
        }

        for (const k in this.components) {
            const v = this.components[k];

            if (v instanceof Component) {
                this._cbits = subtractBit(this._cbits, v._cbit);
                v._onDestroyed();
            } else if (v instanceof Array) {
                for (const component of v) {
                    this._cbits = subtractBit(this._cbits, component._cbit);
                    component._onDestroyed();
                }
            } else {
                for (const component of Object.values(v)) {
                    this._cbits = subtractBit(this._cbits, component._cbit);
                    component._onDestroyed();
                }
            }

            delete (this as EntityType)[k];
            delete this.components[k];
        }

        this._candidacy();
        this.world._destroyed(this.id);
        this.components = {};
        this.isDestroyed = true;
    }

    serialize(): SerializedEntity {
        const components: ComponentProperties | ComponentProperties[] = {};

        for (const k in this.components) {
            const v = this.components[k];

            if (v instanceof Component) {
                components[k] = serializeComponent(v);
            } else if (v instanceof Array) {
                components[k] = serializeComponentArray(v);
            } else {
                components[k] = serializeComponentKeyed(v);
            }
        }

        return {

            ...components,
            id: this.id,
        };
    }

    clone() {
        return this.world.cloneEntity(this);
    }

    fireEvent<T>(name: string, data: T) {
        const evt = new EntityEvent<T>(name, data);

        for (const key in this.components) {
            const v = this.components[key];

            if (v instanceof Component) {
                v._onEvent(evt);

                if (evt.prevented) {
                    return evt;
                }
            } else if (v instanceof Array) {
                for (let i = 0; i < v.length; i++) {
                    v[i]._onEvent(evt);

                    if (evt.prevented) {
                        return evt;
                    }
                }
            } else {
                for (const component of Object.values(v)) {
                    component._onEvent(evt);

                    if (evt.prevented) {
                        return evt;
                    }
                }
            }
        }

        return evt;
    }
}
