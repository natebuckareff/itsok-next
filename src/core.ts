import { GuardAssertionError } from './error';
import { createGuard, Guard, innerGuard, unsafeRenameGuard } from './guard';
import { isPlainObject } from './object';
import { identifyValue } from './util';

export const is = <T>(value: any): Guard<any, T> =>
    createGuard('is', [value as any], () => x => {
        if (!Object.is(x, value)) {
            throw new GuardAssertionError(
                `expected "${value}", got ${identifyValue(x)}`,
            );
        }
    });

// Getting the static types to work for checking if something is "not" not some
// type, is quite exhausting. The extra `X` paramter in the guard type is
// necessary to faciliate that and ends up infecting everything

export const isNot = <X, T extends X>(
    values: T | T[],
): Guard<X, Exclude<X, T>> =>
    createGuard('isNot', [values as any], () => x => {
        const all = Array.isArray(values) ? values : [values];
        for (const n of all) {
            if (Object.is(x, n)) {
                throw new GuardAssertionError(
                    `got "${identifyValue(
                        n,
                    )}", but expected value to not be: ${all
                        .map(identifyValue)
                        .join(' | ')}`,
                );
            }
        }
    });

export const typeOf = <T>(typeName: string): Guard<any, T> =>
    createGuard('typeOf', [typeName], () => x => {
        if (typeof x !== typeName) {
            throw new GuardAssertionError(
                `expected ${typeName}, got ${identifyValue(x)}`,
            );
        }
    });

export const isAny: Guard<any, any> = createGuard('isAny', () => () => {});
export const isUndefined = unsafeRenameGuard('isUndefined', is(undefined));
export const isNull = unsafeRenameGuard('isNull', is(null));

export const isBoolean = unsafeRenameGuard(
    'isBoolean',
    typeOf<boolean>('boolean'),
);

export const isString = unsafeRenameGuard('isString', typeOf<string>('string'));
export const isNumber = unsafeRenameGuard('isNumber', typeOf<number>('number'));

export const isMatch = (pattern: RegExp): Guard<any, string> =>
    createGuard('isMatch', () => x => {
        innerGuard(isString, x);
        if (!pattern.test(x)) {
            throw new GuardAssertionError(
                `expected value to match pattern: ${pattern.source}`,
            );
        }
    });

export type Option<T> = T | undefined;

export const isOption = <T>(grd: Guard<any, T>): Guard<any, T | undefined> =>
    createGuard('isOption', [grd], () => x => {
        if (x === undefined) {
            return;
        }
        innerGuard(grd, x);
    });

export const isArray: Guard<any, any[]> = createGuard('isArray', () => x => {
    if (!Array.isArray(x)) {
        throw new GuardAssertionError(
            `expected array, got ${identifyValue(x)}`,
        );
    }
});

export const isArrayOf = <T>(grd: Guard<any, T>): Guard<any, T[]> =>
    createGuard('isArrayOf', [grd], trace => xs => {
        innerGuard(isArray, xs);
        for (let i = 0; i < xs.length; ++i) {
            trace([i]);
            innerGuard(grd, xs[i]);
        }
    });

export const isNonEmptyArray: Guard<any, [any, ...any[]]> = createGuard(
    'isNonEmptyArray',
    () => x => {
        innerGuard(isArray, x);
        if (x.length === 0) {
            throw new GuardAssertionError(
                'expected non-empty array, got empty array',
            );
        }
    },
);

export type TupleType<Gs extends Guard<any, any>[]> = {
    [K in keyof Gs]: Gs[K] extends Guard<any, infer T> ? T : never;
};

export const isTuple = <Gs extends Guard<any, any>[]>(
    ...grds: Gs
): Guard<any, TupleType<Gs>> =>
    createGuard('isTuple', grds, trace => xs => {
        innerGuard(isArray, xs);
        if (grds.length !== xs.length) {
            throw new GuardAssertionError(
                `expected tuple with length ${grds.length}, got length ${xs.length}`,
            );
        }
        for (let i = 0; i < xs.length; ++i) {
            trace([i]);
            innerGuard(grds[i], xs[i]);
        }
    });

export interface EnumSpec {
    [k: string]: Guard<any, any> | null;
}

export type EnumType<S extends EnumSpec, K = keyof S> = K extends keyof S
    ? S[K] extends null
        ? { type: K }
        : { type: K; value: GuardType<S[K]> }
    : never;

export const isEnum = <S extends EnumSpec>(spec: S): Guard<any, EnumType<S>> =>
    createGuard('isEnum', spec, trace => x => {
        innerGuard(isPlainObject, x);

        if (x['type'] === undefined) {
            throw new GuardAssertionError(`enum missing property "type"`);
        }
        for (const k in x) {
            if (k === 'type' || k === 'value') {
                continue;
            }
            throw new GuardAssertionError(
                `invalid property for enum "${k}", expected "type" or "value"`,
            );
        }

        const type = x['type'];
        innerGuard(isString, type);

        const grd = spec[type];

        if (grd === undefined) {
            const variants = Object.keys(spec)
                .map(x => `"${x}"`)
                .join(', ');

            throw new GuardAssertionError(
                `unknown enum variant "${type}", expected one of: ${variants}`,
            );
        } else if (grd === null) {
            if (x['value'] !== undefined) {
                trace(['value']);
                throw new GuardAssertionError(
                    `expected no value for variant "${type}"`,
                );
            }
        } else {
            trace(['value']);
            innerGuard(grd, x['value']);
        }
    });

export type Ctor<T> = new (...args: any[]) => T;

export const isInstanceOf = <T>(ctor: Ctor<T>): Guard<any, T> =>
    createGuard('isInstanceOf', () => x => {
        if (!(x instanceof ctor)) {
            throw new GuardAssertionError(
                `expected instance of ${ctor.name}, got ${identifyValue(x)}`,
            );
        }
    });

export type GuardType<C> = C extends Guard<any, infer T> ? T : never;

export type GuardUnion<Cs extends Guard<any, any>[]> = {
    [K in keyof Cs]: GuardType<Cs[K]>;
}[number];

export const isUnion = <Cs extends Guard<any, any>[]>(
    ...grds: Cs
): Guard<any, GuardUnion<Cs>> =>
    createGuard('isUnion', grds, () => x => {
        let errors: GuardAssertionError[] = [];
        for (const grd of grds) {
            try {
                grd(x);
                return;
            } catch (err) {
                errors.push(err);
            }
        }

        // find the longest context chain, since that's where we made the most progress
        let longest: GuardAssertionError = errors[0];
        for (let i = 1; i < errors.length; ++i) {
            if (errors[i].context.length > longest.context.length) {
                longest = errors[i];
            }
        }
        throw longest;
    });
