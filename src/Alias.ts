import { Parser } from './Parser';
import { AliasSpec, makeRef } from './Spec';

export function aliasParser<I, O>(
    name: string,
    args: any[],
    parser: Parser<I, O>,
    annotations?: AliasSpec['annotations'],
): Parser<I, O> {
    const aliased: any = (x: any) => parser(x);
    const spec: AliasSpec = {
        kind: 'alias',
        name,
        args,
        base: makeRef(parser.spec),
    };
    if (annotations !== undefined) {
        spec.annotations = annotations;
    }
    aliased.spec = spec;
    return aliased;
}
