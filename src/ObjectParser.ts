import { Parser, AnyParser, parse, EveryParserT, EveryParser } from './Parser';

export class ObjectParser {
    readonly I: ObjectI<this> = undefined!;
    readonly O: ObjectO<this> = undefined!;

    static __singleton?: ObjectParser;
    static __parser?: AnyParser;

    static parse<T extends typeof ObjectParser>(
        this: T,
        input: any,
        strict = true,
    ): ObjectO<InstanceType<T>> {
        if (this.__singleton === undefined) {
            this.__singleton = new this();
        }
        const classParser: any = this.__singleton;

        for (const k in classParser) {
            if (k === 'I' || k === 'O') {
                continue;
            }

            if (classParser.hasOwnProperty(k)) {
                try {
                    parse(classParser[k], input[k]);
                } catch (error) {
                    if (input[k] === undefined) {
                        throw new Error(`Missing property "${k}"`);
                    } else {
                        throw new Error(
                            `Failed to parse value for property "${k}"`,
                        );
                    }
                }
            }
        }

        if (strict) {
            for (const k in input) {
                if (input.hasOwnProperty(k)) {
                    if (classParser[k] === undefined) {
                        throw new Error(`Unknown property "${k}"`);
                    }
                }
            }
        }
        return input as any;
    }

    static getParser<T extends typeof ObjectParser>(
        this: T,
        strict = true,
    ): Parser<unknown, ObjectO<InstanceType<T>>> {
        if (this.__parser !== undefined) {
            return this.__parser;
        }

        const parser = (x: unknown) => this.parse(x, strict);
        this.__parser = parser as any;

        // const name = (this as any).name;
        // const spec: Spec.ClassParser = {
        //     kind: 'class',
        //     name,
        //     props: {},
        // };
        // const inst = new this();
        // for (const k in inst) {
        //     if (inst.hasOwnProperty(k)) {
        //         spec.props[k] = makeRef((inst as any)[k].spec);
        //     }
        // }
        // parser.spec = spec;
        return parser as any;
    }
}

export type ObjectI<T> = {
    [K in keyof Omit<T, keyof ObjectParser>]: T[K] extends EveryParser
        ? EveryParserT<T[K]>['I']
        : never;
};

export type ObjectO<T> = {
    [K in keyof Omit<T, keyof ObjectParser>]: T[K] extends EveryParser
        ? EveryParserT<T[K]>['O']
        : never;
};
