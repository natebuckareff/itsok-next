import { Spec } from './Spec';
import { ObjectParser, ObjectO } from './ObjectParser';

export interface Parser<I, O> {
    (input: I): O;
    readonly I: I;
    readonly O: O;
    readonly spec: Spec;

    // TODO Add fluent combinators
    // unstable_pipe<T>(p: Parser<O, T>): Parser<I, T>;
    // unstable_check(f: (x: I) => boolean): Parser<I, O>;
}

export type AnyParser = Parser<any, any>;

// TODO memoize parsers on `name` and `args`
export function makeParser<I, O>(
    _name: string,
    _args: any[],
    fn: (input: I) => O,
    _annotations?: Spec.ParserSpec['annotations'],
): Parser<I, O> {
    const parser: any = (x: any) => fn(x);
    // const spec: Spec.FunctionParser = {
    //     kind: 'function',
    //     name,
    //     args: [],
    // };
    // if (annotations !== undefined) {
    //     spec.annotations = annotations;
    // }
    // for (const arg of args) {
    //     if (arg !== Object(arg)) {
    //         spec.args!.push({
    //             kind: 'literal',
    //             type: typeof arg,
    //             value: arg,
    //         });
    //     } else if (typeof arg.getParser === 'function') {
    //         const p = arg.getParser() as AnyParser;
    //         spec.args!.push(makeRef(p.spec));
    //     } else if (typeof arg.spec === 'object') {
    //         const p = arg as AnyParser;
    //         spec.args!.push(makeRef(p.spec));
    //     } else {
    //         throw new Error(
    //             `Invalid parser argument: expected literal or parser`,
    //         );
    //     }
    // }
    // parser.spec = spec;
    return parser as Parser<I, O>;
}

export function unstable_pipe<X, Y, Z>(
    f: Parser<X, Y>,
    g: Parser<Y, Z>,
): Parser<X, Z> {
    const parser = (x: X): Z => g(f(x));
    /*
    TODO How to compose specs?
    P<unknown, string>
    P<string, HexByteString>
    */
    return parser as Parser<X, Z>;
}

// TODO Should the predicate run after parsing? Probably
export function unstable_check<I, O>(
    p: Parser<I, O>,
    f: (x: I) => boolean,
): Parser<I, O> {
    const parser = (x: I) => {
        if (!f(x)) {
            throw Error();
        }
        return p(x);
    };
    /*
    TODO Does it make sense for this to have a spec?
    */
    return parser as Parser<I, O>;
}

// Type representin function and class parsers
export type EveryParser = AnyParser | typeof ObjectParser;
export type EveryParserT<T extends EveryParser> = T extends AnyParser
    ? T
    : T extends typeof ObjectParser
    ? Parser<unknown, ObjectO<InstanceType<T>>>
    : never;

export type EveryParserO<T> = T extends EveryParser
    ? EveryParserT<T>['O']
    : never;

// Given a function or class parser, get back a function parser
export function getParser<T extends EveryParser>(x: T): EveryParserT<T> {
    if (typeof (x as any)?.getParser === 'function') {
        return (x as any).getParser();
    } else {
        return x as any;
    }
}

// Generic parse utility
export function parse<P extends EveryParser, T>(
    p: P,
    x: T,
): EveryParserT<P>['O'] {
    return getParser(p)(x);
}
