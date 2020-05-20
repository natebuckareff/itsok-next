import { EnumSpec } from './Spec';
import { Parser, AnyParser } from './Parser';

export interface EnumSchema {
    [k: string]: AnyParser | null;
}

// TODO Could this and Class.ts be DRYied up?
export class Enum implements EnumSchema {
    [k: string]: AnyParser | null;

    static __singleton?: Enum;
    static __parser?: AnyParser;

    static parse<T extends typeof Enum>(
        this: T,
        input: any,
    ): EnumT<InstanceType<T>> {
        if (this.__singleton === undefined) {
            this.__singleton = new this();
        }
        const enumParser: any = this.__singleton;

        if (input.type === undefined) {
            throw new Error('Expected "type" property');
        }

        const parser = enumParser[input.type];
        if (parser === undefined) {
            throw new Error(`Unknown variant "${input.type}"`);
        } else if (parser === null) {
            if (input.value !== undefined) {
                throw new Error(
                    `Expected no value for variant "${input.type}"`,
                );
            }
        } else {
            parser(input.value);
        }

        return input as any;
    }

    static getParser<T extends typeof Enum>(
        this: T,
    ): Parser<unknown, EnumT<InstanceType<T>>> {
        if (this.__parser !== undefined) {
            return this.__parser;
        }

        const parser = (x: unknown) => Enum.parse(x);
        this.__parser = parser;

        const name = (this as any).name;
        const spec: EnumSpec = {
            kind: 'enum',
            name,
            variants: {},
        };
        const inst = new this();
        for (const k in inst) {
            if (inst.hasOwnProperty(k)) {
                const v = (inst as any)[k];
                if (v === null) {
                    spec.variants[k] = null;
                } else {
                    spec.variants[k] = v.spec;
                }
            }
        }
        parser.spec = spec;
        return parser as any;
    }
}

export type EnumT<S extends EnumSchema, K = keyof S> = K extends keyof S
    ? S[K] extends null
        ? { type: K }
        : { type: K; value: S[K] extends Parser<any, infer O> ? O : never }
    : never;
