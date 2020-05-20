import { makeParser } from './Parser';

export function typeOf<T>(typeName: string) {
    return makeParser<unknown, T>('typeOf', [typeName], x => {
        if (typeof x === typeName) {
            return x as T;
        }
        throw new Error(`Expected ${typeName}, but got ${typeof x} instead`);
    });
}

export function objectIs<T>(value: any) {
    return makeParser<unknown, T>('objectIs', [value], x => {
        if ((<any>Object).is(x, value)) {
            return x as T;
        }
        throw new Error(`Expected ${value}, but got ${x} instead`);
    });
}

const to = <T>(name: string, typeName: string) => {
    return makeParser(name, [], typeOf<T>(typeName));
};

const oi = <T>(name: string, value: any) => {
    return makeParser(name, [], objectIs<T>(value));
};

export const Null = oi<null>('Null', null);
export const Undefined = to<undefined>('Undefined', 'undefined');
export const Boolean = to<boolean>('Boolean', 'boolean');
export const String = to<string>('String', 'string');
export const Number = to<number>('Number', 'number');
export const Symbol = to<symbol>('Symbol', 'symbol');
export const BigInt = to<bigint>('BigInt', 'bigint');
