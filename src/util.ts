export function memo<Args extends any[], R>(fn: (...args: Args) => R) {
    const basemap = new Map<any, any>();
    return (...args: Args): R => {
        let map = basemap;
        let i = 0;
        for (; i < args.length - 1; ++i) {
            let k = args[i];
            let r = map.get(k);
            if (r === undefined) {
                r = new Map();
                map.set(k, r);
            }
            map = r;
        }
        let k = args[i];
        let r = map.get(k);
        if (r === undefined) {
            r = fn(...args);
            map.set(k, r);
        }
        return r;
    };
}

export const identifyValue = (x: any) => {
    if (Object.is(x, null)) {
        return `"null"`;
    } else if (typeof x === 'object') {
        return `"${x.constructor.name}"`;
    } else {
        return `"${typeof x}"`;
    }
};

export const objectLike = (x: any) => {
    return Object.prototype.toString.call(x) === '[object Object]';
};

export const plainObjectError = (x: unknown) => {
    return `expected plain object, not ${identifyValue(x)}`;
};
