import { Parser, makeParser } from './Parser';

function _Array<I, O>(parser: Parser<I, O>): Parser<I, O[]> {
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
