import { Parser, makeParser, EveryParser, EveryParserT, parse } from './Parser';

function _Array<P extends EveryParser>(
    parser: P,
): Parser<unknown, EveryParserT<P>['O'][]> {
    return makeParser('Array', [parser], array => {
        if (Array.isArray(array)) {
            for (const x of array) {
                parse(parser, x);
            }
            return array;
        }
        throw new Error('Expected an array');
    });
}

export { _Array as Array };
