import {
    isArrayOf,
    isBoolean,
    isNull,
    isNumber,
    isString,
    isUnion,
} from '../core';
import { createGuard, Guard, innerGuard } from '../guard';
import { isRecord } from '../object';

export type Json = Json.Primitive | Json.Array | Json.Object;

export namespace Json {
    export type Primitive = null | boolean | string | number;
    export type Array = Json[];
    export type Object = { [k: string]: Json };

    export const isJson: Guard<any, Json> = createGuard(
        'Json.isJson',
        () => x => {
            innerGuard(isUnion(isPrimitive, isArray, isObject), x);
        },
    );

    export const isPrimitive: Guard<any, Primitive> = createGuard(
        'Json.isPrimitive',
        () => x => {
            innerGuard(isUnion(isNull, isBoolean, isString, isNumber), x);
        },
    );

    export const isArray: Guard<any, Array> = createGuard(
        'Json.isArray',
        () => x => {
            innerGuard(isArrayOf(isJson), x);
        },
    );

    export const isObject: Guard<any, Object> = createGuard(
        'Json.isObject',
        () => x => {
            innerGuard(isRecord(isJson), x);
        },
    );
}
