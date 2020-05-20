export type Spec = ParserSpec | ClassSpec | EnumSpec | AliasSpec;

export interface ParserSpec {
    kind: 'parser';
    name: string;
    args: Arg[];
}

export interface ClassSpec {
    kind: 'class';
    name: string;
    props: {
        [k: string]: Ref;
    };
    annotations?: {
        [k: string]: any;
    };
}

export interface EnumSpec {
    kind: 'enum';
    name: string;
    variants: {
        [k: string]: Ref | null;
    };
}

export interface AliasSpec {
    kind: 'alias';
    name: string;
    args: Arg[];
    base: Ref;
    annotations?: {
        [k: string]: any;
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
    if (spec.kind === 'parser') {
        return {
            kind: 'parserRef',
            name: spec.name,
            args: spec.args,
        };
    } else if (spec.kind === 'class') {
        return {
            kind: 'parserRef',
            name: spec.name,
        };
    } else {
        return {
            kind: 'aliasRef',
            name: spec.name,
        };
    }
}
