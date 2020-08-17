import { GuardAssertionError, longGuardErrorMessage } from './error';
import { MemoMap } from './MemoMap';
import { Json } from './types/Json';

export interface GuardLike<X, T extends X> {
    (x: X): asserts x is T;
}

export type GuardArgs = GuardArg[] | Record<any, GuardArg>;
export type GuardArg = Json | Guard<any, any>;

export interface Guard<X, T extends X> extends GuardLike<X, T> {
    readonly T: T;
    readonly meta: {
        type: 'builtin' | 'aliased' | 'object';
        name: string;
        args?: GuardArgs;
        annotations?: Json;
    };
}

export type GuardType<G> = G extends Guard<any, infer T> ? T : never;

export function guard<X, T extends X>(grd: Guard<X, T>, x: X): asserts x is T {
    _guard(grd, x, false);
}

export function innerGuard<X, T extends X>(
    grd: Guard<X, T>,
    x: X,
): asserts x is T {
    _guard(grd, x, true);
}

function _guard<X, T extends X>(
    grd: Guard<X, T>,
    x: X,
    inner: boolean,
): asserts x is T {
    if (inner) {
        grd(x);
    } else {
        try {
            grd(x);
        } catch (error) {
            if (error instanceof GuardAssertionError) {
                error.logged = true;
                console.error(longGuardErrorMessage(error));
            }
            throw error;
        }
    }
}

export function check<X, T extends X>(grd: Guard<X, T>, x: X): x is T {
    try {
        grd(x);
        return true;
    } catch (_) {
        return false;
    }
}

export function parse<X, T extends X>(grd: Guard<X, T>, x: X): T {
    grd(x);
    return x;
}

export type MutableGuard<G extends Guard<any, any>> = {
    -readonly [P in keyof G]: G[P];
};

export const unsafeRenameGuard = <X, T extends X>(
    name: string,
    grd: Guard<X, T>,
): Guard<X, T> => {
    const mut: MutableGuard<Guard<X, T>> = grd as any;
    mut.meta.name = name;
    return mut as any;
};

export function createGuard<X, T extends X>(
    name: string,
    grd: Guard<X, T>,
): Guard<X, T>;

export function createGuard<X, T extends X>(
    name: string,
    args: GuardArgs,
    fn: (trace: (path: any[]) => void) => GuardLike<X, T>,
): Guard<X, T>;

export function createGuard<X, T extends X>(
    name: string,
    fn: (trace: (path: any[]) => void) => GuardLike<X, T>,
): Guard<X, T>;

export function createGuard<X, T extends X>(
    name: string,
    arg1: any,
    arg2?: any,
): Guard<X, T> {
    if (arg2 === undefined) {
        if (arg1.meta !== undefined && typeof arg1.meta.name === 'string') {
            // probably a guard
            return _createGuardAlias(name, arg1);
        } else {
            return _createGuard(name, undefined, arg1);
        }
    } else {
        return _createGuard(name, arg1, arg2);
    }
}

// global cache of guard functions keys on `args`
const CREATE_GUARD_CACHE: Map<
    string,
    MemoMap<any, GuardLike<any, any>>
> = new Map();

function _createGuard<X, T extends X>(
    name: string,
    args: GuardArgs | undefined,
    fn: (trace: (path: any[]) => void) => GuardLike<X, T>,
): Guard<X, T> {
    const meta: Guard<any, any>['meta'] = {
        type: 'builtin',
        name,
        args,
    };

    let tracePath: string[] = [];
    const trace = (path: any[]) => {
        tracePath = path;
    };

    // TODO skip memoization for object guards
    let mmap = CREATE_GUARD_CACHE.get(name);
    if (args !== undefined && Array.isArray(args) && mmap === undefined) {
        mmap = new MemoMap();
        CREATE_GUARD_CACHE.set(name, mmap);
    }

    let grd: GuardLike<X, T> | undefined;
    if (mmap !== undefined) {
        grd = mmap.get(args);
    }

    if (grd === undefined) {
        grd = x => {
            const computedGuard: GuardLike<X, T> = fn(trace);
            try {
                computedGuard(x);
            } catch (error) {
                if (error instanceof GuardAssertionError) {
                    if (error.logged) {
                        throw new Error(
                            'Must use innerGuard() instead of guard() inside of createGuard(). ' +
                                'The last GuardAssertionError may be incomplete',
                        );
                    }
                    error.context.push({
                        guard: grd as Guard<X, T>,
                        path: tracePath,
                        value: x,
                    });
                }
                throw error;
            }
        };

        if (mmap !== undefined) {
            mmap.set(args, grd);
        }
    }

    const mut: MutableGuard<Guard<X, T>> = grd as any;
    mut.meta = meta;
    return mut as any;
}

// Most users will just want to alias some composed guards
function _createGuardAlias<X, T extends X>(
    name: string,
    grd: Guard<X, T>,
): Guard<X, T> {
    const aliased: GuardLike<X, T> = x => {
        try {
            innerGuard(grd, x);
        } catch (error) {
            if (error instanceof GuardAssertionError) {
                if (error.logged) {
                    throw new Error(
                        'Must use innerGuard() instead of guard() inside of createGuard(). ' +
                            'The last GuardAssertionError may be incomplete',
                    );
                }
                error.context.push({
                    guard: aliased as Guard<any, any>,
                    path: [],
                    value: x,
                });
            }
            throw error;
        }
    };

    const mut: MutableGuard<Guard<X, T>> = aliased as any;
    mut.meta = {
        type: 'aliased',
        name,
        args: [grd],
    };
    return mut as any;
}
