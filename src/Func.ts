import { EveryParser, EveryParserT, parse, Parser } from './Parser';
import { Record, RecordT } from './Record';

export type ParamT<P extends EveryParser[]> = {
    [K in keyof P]: P[K] extends EveryParser ? EveryParserT<P[K]>['O'] : never;
};

export interface Params<P extends EveryParser[]> {
    params: P;
}

export function Params<P extends EveryParser[]>(...params: P): Params<P> {
    return { params };
}

export type PropsT<P extends { [k: string]: EveryParser }> = {
    [K in keyof P]: P[K] extends EveryParser ? EveryParserT<P[K]>['O'] : never;
};

export interface Props<P extends { [k: string]: EveryParser }> {
    props: P;
}

export function Props<P extends { [k: string]: EveryParser }>(
    props: P,
): Props<P> {
    return { props };
}

export interface Return<R extends EveryParser> {
    ret: R;
}

export function Return<R extends EveryParser>(ret: R): Return<R> {
    return { ret };
}

export type Func<P extends EveryParser[], R extends EveryParser> = (
    ...args: ParamT<P>
) => EveryParserT<R>['O'];

export function Func<P extends EveryParser[]>(
    params: Params<P>,
    fn: Func<P, any>,
): Func<P, any>;

export function Func<P extends EveryParser[], R extends EveryParser>(
    params: Params<P>,
    ret: Return<R>,
    fn: Func<P, R>,
): Func<P, R>;

export function Func<P extends { [k: string]: EveryParser }>(
    props: Props<P>,
    fn: Func<[Parser<any, RecordT<P>>], any>,
): Func<[Parser<any, RecordT<P>>], any>;

export function Func<
    P extends { [k: string]: EveryParser },
    R extends EveryParser
>(
    props: Props<P>,
    ret: Return<R>,
    fn: Func<[Parser<any, RecordT<P>>], any>,
): Func<[Parser<any, RecordT<P>>], any>;

export function Func(arg0: any, arg1: any, arg2?: any): any {
    const fn = arg2 ?? arg1;
    return (...args: any[]) => {
        if (arg0.params) {
            const params: Params<any> = arg0;
            if (params.params.length !== args.length) {
                throw new Error(
                    `Was expecting ${params.params.length} argument(s), but got ${args.length}`,
                );
            }
            for (let i = 0; i < args.length; ++i) {
                parse(params.params[i], args[i]);
            }
        } else {
            const props: Props<any> = arg0;
            const record = Record(props.props);
            if (args.length !== 1) {
                throw new Error(
                    `Was expected one argument, but got ${args.length}`,
                );
            }
            record(args[0]);
        }

        const result = fn(...args);
        if (arg2 === undefined) {
            return result;
        } else {
            const ret: Return<any> = arg1;
            return parse(ret.ret, result);
        }
    };
}
