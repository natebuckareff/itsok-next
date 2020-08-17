import { GuardAssertionError } from './error';
import {
    check,
    createGuard,
    Guard,
    guard,
    innerGuard,
    MutableGuard,
    parse,
} from './guard';
import { objectLike, plainObjectError } from './util';

export const isPlainObject: Guard<any, { [k: string]: any }> = createGuard(
    'isPlainObject',
    () => x => {
        if (!objectLike(x)) {
            throw new GuardAssertionError(plainObjectError(x));
        }

        const ctor = (x as any).constructor;
        if (ctor === undefined) {
            return;
        }

        const proto = ctor.prototype;
        // TODO is this supposed to be a guard??
        if (!isObject(proto)) {
            throw new GuardAssertionError(plainObjectError(x));
        }

        if (!proto.hasOwnProperty('isPrototypeOf')) {
            throw new GuardAssertionError(plainObjectError(x));
        }
    },
);

export function isRecord<K extends string, T>(
    keys: K[],
    grd: Guard<any, T>,
): Guard<any, Record<K, T>>;

export function isRecord<T>(grd: Guard<any, T>): Guard<any, Record<string, T>>;

export function isRecord(arg1: any, arg2?: any) {
    if (arg2 === undefined) {
        return _isRecord(undefined, arg1);
    } else {
        return _isRecord(arg1, arg2);
    }
}

function _isRecord<K extends string, T>(
    keys: K[] | undefined,
    grd: Guard<any, T>,
): Guard<any, Record<K, T>> {
    return createGuard(
        'isRecordOf',
        { keys: keys ?? null, grd },
        trace => x => {
            innerGuard(isPlainObject, x);
            for (const k in x) {
                trace([k]);
                if (keys && !keys.includes(k as any)) {
                    throw new GuardAssertionError(`unknown property "${k}"`);
                }
                innerGuard(grd, x[k]);
            }
            if (keys) {
                for (const k of keys) {
                    if (x[k] === undefined) {
                        trace([k]);
                        throw new GuardAssertionError(
                            `missing property "${k}"`,
                        );
                    }
                }
            }
        },
    );
}

export interface ObjectSpec {
    [k: string]: Guard<any, any>;
}

type ExtractNotUndefined<T> = {
    [P in keyof T]: Extract<T[P], undefined> extends never ? P : never;
}[keyof T];

type ExtractMaybeUndefined<T> = {
    [P in keyof T]: Extract<T[P], undefined> extends never ? never : P;
}[keyof T];

// promotes all properties with type `T | undefined` to optional
// { [k: string]: T } -> { [k: string]?: T }

type ForceOptional<T> = Required<Pick<T, ExtractNotUndefined<T>>> &
    Partial<Pick<T, ExtractMaybeUndefined<T>>>;

type PromotedObjectType<S extends ObjectSpec> = ForceOptional<ObjectType<S>>;

export type ObjectType<S extends ObjectSpec> = {
    [K in keyof S]: S[K] extends Guard<any, infer T> ? T : never;
};

export const isObject = <S extends ObjectSpec>(
    spec: S,
): Guard<any, PromotedObjectType<S>> =>
    createGuard('isObjectOf', spec, trace => x => {
        innerGuard(isPlainObject, x);
        for (const k in x) {
            trace([k]);
            if (spec[k] === undefined) {
                throw new GuardAssertionError(`unknown property "${k}"`);
            }
            innerGuard(spec[k], x[k]);
        }
        for (const k in spec) {
            if (x[k] === undefined) {
                if (spec[k].meta.name === 'isOption') {
                    continue;
                }
                trace([k]);
                throw new GuardAssertionError(`missing property "${k}"`);
            }
        }
    });

export const isPartial = <S extends ObjectSpec>(
    spec: S,
): Guard<any, Partial<ObjectType<S>>> =>
    createGuard('isPartial', spec, trace => x => {
        innerGuard(isPlainObject, x);
        for (const k in x) {
            trace([k]);
            if (spec[k] === undefined) {
                throw new GuardAssertionError(`unknown property "${k}"`);
            }
            if (x[k] !== undefined) {
                innerGuard(spec[k], x[k]);
            }
        }
    });

export class ObjectGuard {
    readonly T: PromotedObjectGuardType<this> = undefined!;

    static __singleton?: ObjectGuard;
    static __guard?: Guard<any, any>;

    static getSingleton(): ObjectGuard {
        if (this.__singleton === undefined) {
            this.__singleton = new this();
        }
        return this.__singleton;
    }

    static getSpec<T extends typeof ObjectGuard>(this: T): ObjectSpec {
        const singleton = this.getSingleton();
        const spec: ObjectSpec = {};
        for (const k in singleton) {
            if (k === 'T') {
                continue;
            }
            if (singleton.hasOwnProperty(k)) {
                spec[k] = (singleton as any)[k];
            }
        }
        return spec;
    }

    static getGuard<T extends typeof ObjectGuard>(this: T): Guard<any, any> {
        if (this.__guard === undefined) {
            const mut: MutableGuard<Guard<any, any>> = isObject(this.getSpec());
            mut.meta.name = this.name;
            mut.meta.type = 'object';
            this.__guard = mut as Guard<any, any>;
        }
        return this.__guard;
    }

    static guard<T extends typeof ObjectGuard>(
        this: T,
        x: unknown,
    ): asserts x is PromotedObjectGuardType<InstanceType<T>> {
        guard(this.getGuard(), x);
    }

    static parse<T extends typeof ObjectGuard>(
        this: T,
        x: unknown,
    ): PromotedObjectGuardType<InstanceType<T>> {
        return parse(this.getGuard(), x);
    }

    static check<T extends typeof ObjectGuard>(
        this: T,
        x: unknown,
    ): x is PromotedObjectGuardType<InstanceType<T>> {
        return check(this.getGuard(), x);
    }
}

export type ObjectGuardType<T> = {
    [K in keyof Omit<T, keyof ObjectGuard>]: T[K] extends Guard<any, infer T>
        ? T
        : never;
};

export type PromotedObjectGuardType<T> = ForceOptional<ObjectGuardType<T>>;
