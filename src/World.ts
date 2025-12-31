import { Entity } from './Entity.js';
import {Query, type QueryFilter} from './Query';
import { camelString } from './util/string-util';
import type {Engine} from "./Engine";
import type {EntityId, SerializedEntity} from "./types/basic-types";

export class World {
    private _id = 0;
    private _queries: Query[] = [];
    public _entities: Map<EntityId, Entity> = new Map();

    engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    createId() {
        return ++this._id + Math.random().toString(36).substr(2, 9);
    }

    getEntity(id: EntityId) {
        return this._entities.get(id);
    }

    getEntities() {
        return this._entities.values();
    }

    createEntity(id = this.createId()) {
        const entity = new Entity(this, id);

        this._entities.set(id, entity);

        return entity;
    }

    destroyEntity(id: EntityId) {
        const entity = this.getEntity(id);

        if (entity) {
            entity.destroy();
        }
    }

    destroyEntities() {
        this._entities.forEach((entity) => {
            entity.destroy();
        });
    }

    destroy() {
        this.destroyEntities();
        this._id = 0;
        this._queries = [];
        this._entities = new Map();
    }

    createQuery(filters: QueryFilter) {
        const query = new Query(this, filters);

        this._queries.push(query);

        return query;
    }

    createPrefab(name: string, properties = {}) {
        return this.engine._prefabs.create(this, name, properties);
    }

    serialize(entities: Entity[]) {
        const json: SerializedEntity[] = [];
        const list = entities || this._entities;

        list.forEach((e) => {
            json.push(e.serialize());
        });

        return {
            entities: json,
        };
    }

    cloneEntity(entity: Entity) {
        const data = entity.serialize();

        data.id = this.createId();

        return this._deserializeEntity(data);
    }

    deserialize(data: {entities: SerializedEntity[]}) {
        for (const entityData of data.entities) {
            this._createOrGetEntityById(entityData.id);
        }

        for (const entityData of data.entities) {
            this._deserializeEntity(entityData);
        }
    }

    _createOrGetEntityById(id: EntityId) {
        return this.getEntity(id) || this.createEntity(id);
    }

    _deserializeEntity(data: SerializedEntity ) {
        const { id, ...components } = data;
        const entity = this._createOrGetEntityById(id);
        entity._qeligible = false;

        Object.entries(components).forEach(([key, value]) => {
            const type = camelString(key);
            const def = this.engine._components.get(type);

            if (def.allowMultiple) {
                Object.values(value).forEach((d) => {
                    entity.add(def, d);
                });
            } else {
                if (typeof value !== "string") {
                    entity.add(def, value);
                }
            }
        });

        entity._qeligible = true;
        entity._candidacy();

        return entity;
    }

    _candidate(entity: Entity) {
        this._queries.forEach((q: Query) => q.candidate(entity));
    }

    _destroyed(id: EntityId) {
        return this._entities.delete(id);
    }
}
