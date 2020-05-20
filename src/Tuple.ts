import { Parser, AnyParser, makeParser } from './Parser';

export type TupleT<Ps extends AnyParser[]> = {
    [K in keyof Ps]: Ps[K] extends Parser<any, infer O> ? O : never;
};

export function Tuple<Ps extends AnyParser[]>(...parsers: Ps) {
    return makeParser<unknown, TupleT<Ps>>('Tuple', parsers, tuple => {
        if (Array.isArray(tuple)) {
            if (tuple.length !== parsers.length) {
                throw new Error(`Tuple with unexpected length ${tuple.length}`);
            }
            for (let i = 0; i < tuple.length; ++i) {
                parsers[i](tuple[i]);
            }
            return tuple as any;
        }
        throw new Error('Expected an array');
    });
}
