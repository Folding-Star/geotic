import type {Component} from "../Component";

export type ComponentProperties = { [key: string]: any };
export type ComponentClass = (new(properties?: ComponentProperties) => Component) & {
	allowMultiple: boolean;
	keyProperty: string;
}

export type EntityId = string;

export type SerializedEntity = Record<string, ComponentProperties | ComponentProperties[] | string> & {
	id: string;
}