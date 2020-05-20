import { Parser, AnyParser, makeParser } from './Parser';

export type Unionize<T extends any[]> = T[number];

export type UnionT<Ps extends AnyParser[]> = Unionize<
    { [K in keyof Ps]: Ps[K] extends Parser<any, infer O> ? O : never }
>;

export function Union<Ps extends AnyParser[]>(...parsers: Ps) {
    return makeParser<unknown, UnionT<Ps>>('Union', parsers, x => {
        let lastError: Error | undefined;
        for (let i = 0; i < parsers.length; ++i) {
            const parser = parsers[i];
            try {
                return parser(x);
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    });
}
