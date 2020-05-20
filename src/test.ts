import * as ok from './Primitive';
import * as util from 'util';
import { Array } from './Array';
import { Class, ClassT } from './Class';
import { Enum } from './Enum';
import { Tuple } from './Tuple';
import { Union } from './Union';
import { makeParser, AnyParser } from './Parser';

const log = (...args: any[]) => {
    console.log(...args.map(x => util.inspect(x, true, null)));
};

const ID = makeParser('ID', [], ok.String, {
    'postgres.type': 'primary_key',
});

class User extends Class {
    id = ID;
    username = ok.String;
    nothing = ok.Null;
    tags = Array(ok.String);
}

console.log(User.getParser().spec);
console.log(ID.spec);

const i: ClassT<User> = {
    id: '42',
    username: 'alice',
    nothing: null,
    tags: ['42', 'asdf'],
};
const x = User.parse(i);
console.log(x);
console.log(x === i);

const boolTuple = Tuple(ok.Boolean, ok.Number);
const y = boolTuple([false, 42]);
console.log(y);

const maybe = Union(ok.Boolean, ok.Number);
const z = maybe(10);
console.log(z);

class Option extends Enum {
    Some = ok.String;
    None = null;
}
const w = Option.parse({ type: 'None' });
console.log(w);
console.log(Option.getParser().spec);

const NumberArray1 = makeParser('NumberArray', [], Array(ok.Number), {
    migrator: {},
});
log(NumberArray1.spec);

function Nullable<P extends AnyParser>(parser: P) {
    return makeParser<P['I'], P['O']>('Nullable', [parser], parser);
}

function Default<P extends AnyParser>(parser: P, defaultValue: () => P['O']) {
    return makeParser<P['I'], P['O']>('Default', [], parser, {
        migrator: { defaultValue },
    });
}

function Reference<M extends Class>(cls: new () => M, key: keyof M) {
    const parser = (cls as any).getParser();
    return makeParser<unknown, ClassT<M>>('Reference', [cls, key], parser);
}

const r = Reference(User, 'id');
log('@', r.spec);
log('@', User.getParser().spec);

class UserT extends Class {
    id = ID;
    username = Default(ok.String, () => '');
}

class AuthEmailT extends Class {
    id = ID;
    email = ok.String;
    userId = Nullable(Reference(UserT, 'id'));
    hash = ok.String;
    salt = ok.String;
    reps = ok.String;
}

log(AuthEmailT.getParser().spec);
