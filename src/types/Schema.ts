import { Json } from './Json';

export type Schema = {
    roots: {
        [k: string]: number;
    };
    guards: Schema.GuardDefinition[];
};

export namespace Schema {
    export interface Annotations {
        [k: string]: Json;
    }

    export type GuardDefinition = BuiltinGuard | AliasedGuard | ObjectGuard;

    export interface BuiltinGuard {
        type: 'builtin';
        name: string;
        args?: GuardArgs;
        annotations?: Annotations;
    }

    export interface AliasedGuard {
        type: 'aliased';
        name: string;
        index: number;
        annotations?: Annotations;
    }

    export interface ObjectGuard {
        type: 'object';
        name: string;
        props: {
            [k: string]: number;
        };
        annotations?: Annotations;
    }

    export type GuardArgs = Arg[] | Props;
    export type Props = { [k: string]: Arg };
    export type Arg = LiteralArg | GuardArg;

    export interface LiteralArg {
        type: 'literal';
        value: Json;
    }

    export interface GuardArg {
        type: 'guard';
        index: number;
    }
}
