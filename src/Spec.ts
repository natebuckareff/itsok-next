export type Spec = FunctionParser | ClassParser | EnumParser;

export interface ParserSpec {
    name: string;
    annotations?: {
        [k: string]: any;
    };
}

export interface FunctionParser extends ParserSpec {
    kind: 'function';
    args: Arg[];
}

export interface ClassParser extends ParserSpec {
    kind: 'class';
    props: {
        [k: string]: Ref;
    };
}

export interface EnumParser extends ParserSpec {
    kind: 'enum';
    variants: {
        [k: string]: Ref | null;
    };
}

export interface ParserRef {
    kind: 'parserRef';
    name: string;
    args?: Arg[];
}

export interface AliasRef {
    kind: 'aliasRef';
    name: string;
}

export interface Literal {
    kind: 'literal';
    type: string;
    value: any;
}

export type Arg = Ref | Literal;
export type Ref = ParserRef | AliasRef;

export function makeRef(spec: Spec): Ref {
    if (spec.kind === 'function') {
        return {
            kind: 'parserRef',
            name: spec.name,
            args: spec.args,
        };
    } else {
        return {
            kind: 'parserRef',
            name: spec.name,
        };
    }
}
