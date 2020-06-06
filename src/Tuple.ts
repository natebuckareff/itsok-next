import { EveryParser, EveryParserT, makeParser, parse } from './Parser';

export type TupleT<Ps extends EveryParser[]> = {
    [K in keyof Ps]: Ps[K] extends EveryParser
        ? EveryParserT<Ps[K]>['O']
        : never;
};

export function Tuple<Ps extends EveryParser[]>(...parsers: Ps) {
    return makeParser<unknown, TupleT<Ps>>('Tuple', parsers, tuple => {
        if (Array.isArray(tuple)) {
            if (tuple.length !== parsers.length) {
                throw new Error(`Tuple with unexpected length ${tuple.length}`);
            }
            for (let i = 0; i < tuple.length; ++i) {
                parse(parsers[i], tuple[i]);
            }
            return tuple as any;
        }
        throw new Error('Expected an array');
    });
}
