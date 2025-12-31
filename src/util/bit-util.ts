const ONE = 1n;

export const subtractBit = (num: bigint, bit: bigint) => {
    return num & ~(1n << bit);
};

export const addBit = (num: bigint, bit: bigint) => {
    return num | (ONE << bit);
};

export const hasBit = (num: bigint, bit: bigint) => {
    return (num >> bit) % 2n !== 0n;
};

export const bitIntersection = (n1: bigint, n2: bigint) => {
    return n1 & n2;
};
