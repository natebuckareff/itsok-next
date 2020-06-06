import { EveryParser, EveryParserT, makeParser, parse } from './Parser';

export type Unionize<T extends any[]> = T[number];

export type UnionT<Ps extends EveryParser[]> = Unionize<
    {
        [K in keyof Ps]: Ps[K] extends EveryParser
            ? EveryParserT<Ps[K]>['O']
            : never;
    }
>;

export function Union<Ps extends EveryParser[]>(...parsers: Ps) {
    return makeParser<unknown, UnionT<Ps>>('Union', parsers, x => {
        let lastError: Error | undefined;
        for (let i = 0; i < parsers.length; ++i) {
            const parser = parsers[i];
            try {
                parse(parser, x);
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    });
}
