import { ComponentRegistry } from './ComponentRegistry';
import {PrefabRegistry, type SerializedPrefabData} from './PrefabRegistry';
import { World } from './World.js';
import type {ComponentClass} from "./types/basic-types";

export class Engine {
    _components = new ComponentRegistry();
    _prefabs = new PrefabRegistry(this);

    registerComponent(clazz: ComponentClass) {
        this._components.register(clazz);
    }

    registerPrefab(data: SerializedPrefabData) {
        this._prefabs.register(data);
    }

    createWorld() {
        return new World(this);
    }

    destroyWorld(world: World) {
        world.destroy();
    }
}
