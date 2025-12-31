import merge from 'deepmerge';
import type {ComponentClass, ComponentProperties} from "./types/basic-types";
import type {Entity, EntityType} from "./Entity";

export default class PrefabComponent {
    clazz: ComponentClass
    properties: ComponentProperties
    overwrite: boolean
    constructor(clazz: ComponentClass, properties = {}, overwrite = true) {
        this.clazz = clazz;
        this.properties = properties;
        this.overwrite = overwrite;
    }

    applyToEntity(entity: EntityType, initialProps = {}) {
        if (!this.clazz.allowMultiple && entity.has(this.clazz)) {
            if (!this.overwrite) {
                return;
            }

            const comp = entity[this.clazz.prototype._ckey];

            entity.remove(comp);
        }

        const props = merge(this.properties, initialProps);

        entity.add(this.clazz, props);
    }
}
