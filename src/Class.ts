import { ClassParser, makeRef } from './Spec';
import { Parser, AnyParser } from './Parser';

export class Class {
    static __singleton?: Class;
    static __parser?: AnyParser;

    static parse<T extends typeof Class>(
        this: T,
        input: any,
    ): ClassT<InstanceType<T>> {
        if (this.__singleton === undefined) {
            this.__singleton = new this();
        }
        const classParser: any = this.__singleton;
        for (const k in classParser) {
            if (classParser.hasOwnProperty(k)) {
                const memberParser = classParser[k] as AnyParser;
                memberParser(input[k]);
            }
        }
        for (const k in input) {
            if (input.hasOwnProperty(k)) {
                if (classParser[k] === undefined) {
                    throw new Error(`Unknown property "${k}"`);
                }
            }
        }
        return input as any;
    }

    static getParser<T extends typeof Class>(
        this: T,
    ): Parser<unknown, ClassT<InstanceType<T>>> {
        if (this.__parser !== undefined) {
            return this.__parser;
        }

        const parser = (x: unknown) => Class.parse(x);
        this.__parser = parser as any;

        const name = (this as any).name;
        const spec: ClassParser = {
            kind: 'class',
            name,
            props: {},
        };
        const inst = new this();
        for (const k in inst) {
            if (inst.hasOwnProperty(k)) {
                spec.props[k] = makeRef((inst as any)[k].spec);
            }
        }
        parser.spec = spec;
        return parser as any;
    }
}

export type ClassT<T> = {
    [K in keyof Omit<T, keyof Class>]: T[K] extends Parser<any, infer O>
        ? O
        : never;
};
