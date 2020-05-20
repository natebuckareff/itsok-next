import { Parser, makeParser } from './Parser';

function _Array<T>(parser: Parser<unknown, T>): Parser<unknown, T[]> {
    return makeParser('Array', [parser], array => {
        if (Array.isArray(array)) {
            for (const x of array) {
                parser(x);
            }
            return array;
        }
        throw new Error('Expected an array');
    });
}

export { _Array as Array };
