import type {World} from "./World";

export class QueryManager {
    _queries = [];
    private _world: World

    constructor(world: World) {
        this._world = world;
    }
}
