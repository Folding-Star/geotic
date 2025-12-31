import { camelString } from './util/string-util';

export class EntityEvent<TData> {
    prevented = false;
    handled = false;

    name: string
    data: TData
    handlerName: string

    constructor(name: string, data: TData) {
        this.name = name;
        this.data = data;
        this.handlerName = camelString(`on ${this.name}`);
    }

    is(name: string) {
        return this.name === name;
    }

    handle() {
        this.handled = true;
        this.prevented = true;
    }

    prevent() {
        this.prevented = true;
    }
}
