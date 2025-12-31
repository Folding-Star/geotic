import { camelString } from './util/string-util';
import type {ComponentClass} from "./types/basic-types";

export class ComponentRegistry {
    _cbit = 0;
    _map: Record<string, ComponentClass> = {};

    register(clazz: ComponentClass) {
        const key = camelString(clazz.name);

        clazz.prototype._ckey = key;
        clazz.prototype._cbit = BigInt(++this._cbit);

        this._map[key] = clazz;
    }

    get(key: string) {
        return this._map[key];
    }
}
