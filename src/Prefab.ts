import type {Entity} from "./Entity";
import type PrefabComponent from "./PrefabComponent";

export default class Prefab {
    name = '';
    inherit: Prefab[] = [];
    components: PrefabComponent[] = [];

    constructor(name: string) {
        this.name = name;
    }

    addComponent(prefabComponent: PrefabComponent) {
        this.components.push(prefabComponent);
    }

    applyToEntity(entity: Entity, prefabProps: any = {}) {
        this.inherit.forEach((parent) => {
            parent.applyToEntity(entity, prefabProps);
        });

        const arrComps: any = {};

        this.components.forEach((component) => {
            const clazz = component.clazz;
            const ckey: string = clazz.prototype._ckey;

            let initialCompProps = {};

            if (clazz.allowMultiple) {
                if (clazz.keyProperty) {
                    const key = component.properties[clazz.keyProperty];

                    if (prefabProps[ckey] && prefabProps[ckey][key]) {
                        initialCompProps = prefabProps[ckey][key];
                    }
                } else {
                    if (!arrComps[ckey]) {
                        arrComps[ckey] = 0;
                    }

                    if (
                        prefabProps[ckey] &&
                        prefabProps[ckey][arrComps[ckey]]
                    ) {
                        initialCompProps = prefabProps[ckey][arrComps[ckey]];
                    }

                    arrComps[ckey]++;
                }
            } else {
                initialCompProps = prefabProps[ckey];
            }

            component.applyToEntity(entity, initialCompProps);
        });

        return entity;
    }
}
