import camelcaseSlow from 'camelcase';

const camelCache: { [key: string]: string } = {};

export const camelString = (value: string) => {
    const result = camelCache[value];

    if (!result) {
        camelCache[value] = camelcaseSlow(value);

        return camelCache[value];
    }

    return result;
};
