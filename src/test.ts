import { isBoolean, isNumber, isOption, isString } from './core';
import { ObjectGuard } from './object';
import { SchemaBuilder } from './SchemaBuilder';
import { Json } from './types/Json';

class User extends ObjectGuard {
    id = isNumber;
    username = isString;
    payload = isOption(Json.isJson);
}

class Foo extends ObjectGuard {
    id = isNumber;
    username = isString;
    payload = isOption(Json.isJson);
    extra = isBoolean;
}

const builder = new SchemaBuilder();
console.log(builder.add(User));
console.log(builder.add(Foo));
console.log(JSON.stringify(builder.schema, null, 2));
