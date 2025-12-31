export const deepClone = <T>(ob: T): T => JSON.parse(JSON.stringify(ob));
