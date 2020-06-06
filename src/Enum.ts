import { EveryParser, EveryParserO, makeParser, parse } from './Parser';

export interface Enum {
    [k: string]: EveryParser | null;
}

export type EnumO<S extends Enum, K = keyof S> = K extends keyof S
    ? S[K] extends null
        ? { type: K }
        : {
              type: K;
              value: EveryParserO<S[K]>;
          }
    : never;

export function Enum<T extends Enum>(en: T) {
    return makeParser<any, EnumO<T>>('Enum', [en], input => {
        if (input.type === undefined) {
            throw new Error('Expected "type" property');
        }

        const parser = en[input.type];

        if (parser === undefined) {
            throw new Error(`Unknown variant "${input.type}"`);
        } else if (parser === null) {
            if (input.value !== undefined) {
                throw new Error(
                    `Expected no value for variant "${input.type}"`,
                );
            }
        } else {
            parse(parser, input.value);
        }

        for (const k in input) {
            if (k !== 'type' && k !== 'value') {
                throw new Error(`Invalid key "${k}" for enum value`);
            }
        }

        return input;
    });
}
