import { isNumber } from '../core';
import { GuardAssertionError } from '../error';
import { createGuard, Guard, guard } from '../guard';
import { Newtype } from './Newtype';

export interface Integer
    extends Newtype<{ readonly Integer: unique symbol }, number> {}

export namespace Integer {
    export const isInteger: Guard<any, Integer> = createGuard(
        'isInteger',
        () => x => {
            guard(isNumber, x);
            if (!Number.isSafeInteger(x)) {
                throw new GuardAssertionError(`not a safe integer: ${x}`);
            }
        },
    );
}
