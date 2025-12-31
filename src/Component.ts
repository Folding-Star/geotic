import { deepClone } from './util/deep-clone';
import type {Entity} from "./Entity";
import type {ComponentProperties} from "./types/basic-types";
import type {EntityEvent} from "./EntityEvent";

export type ComponentType = Component & { [key: string]: any };

export class Component {
    static allowMultiple: boolean = false;
    static keyProperty: string | null = null;
    static properties: ComponentProperties = {};

    entity?: Entity
    _ckey!: string
    _cbit!: bigint

    get world() {
        return this.entity!.world;
    }

    get allowMultiple(): boolean {
        return (this.constructor as unknown as Component).allowMultiple;
    }

    get keyProperty(): string {
        return (this.constructor as unknown as Component).keyProperty;
    }

    constructor(properties: ComponentProperties = {}) {
        const intrinsics = deepClone((this.constructor as any).properties);

        Object.assign(this, intrinsics, properties);
    }

    destroy() {
        this.entity?.remove(this);
    }

    _onDestroyed() {
        this.onDestroyed();
        delete this.entity;
    }

    _onEvent<T>(evt: EntityEvent<T>) {
        this.onEvent(evt);

        if (typeof (this as ComponentType)[evt.handlerName] === 'function') {
            (this as ComponentType)[evt.handlerName](evt);
        }
    }

    _onAttached(entity: Entity) {
        this.entity = entity;
        this.onAttached(entity);
    }

    serialize(): ComponentProperties {
        const ob: ComponentProperties = {};

        for (const key in (this.constructor as any).properties) {
            // @ts-ignore
            ob[key] = this[key] as any;
        }

        return deepClone(ob);
    }

    onAttached(entity: Entity) {}
    onDestroyed() {}
    onEvent<T>(evt: EntityEvent<T>) {}
}
