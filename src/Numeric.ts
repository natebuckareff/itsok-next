import { makeParser } from './Parser';
import { Newtype } from './Newtype';

export interface Integer
    extends Newtype<{ readonly Integer: unique symbol }, number> {}

export const Integer = makeParser<string | number, Integer>(
    'Integer',
    [],
    x => {
        const n: number = typeof x === 'string' ? parseInt(x) : x;
        if (Number.isInteger(n)) {
            return n as any;
        }

        throw new Error(`Expected an integer`);
    },
);
