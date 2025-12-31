import { Engine } from '../../bin/Engine.js';
import { World } from '../../bin/World.js';

describe('Engine', () => {
    let engine;

    beforeEach(() => {
        engine = new Engine();
    });

    describe('createWorld', () => {
        let result;

        beforeEach(() => {
            result = engine.createWorld();
        });

        it('should create a World instance', () => {
            expect(result).toBeInstanceOf(World);
        });
    });
});
