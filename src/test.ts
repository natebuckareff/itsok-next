import * as ok from './Primitive';
import { Class, ClassT } from './Class';
import { aliasParser } from './Alias';
import { Array } from './Array';
import { Tuple } from './Tuple';
import { Union } from './Union';
import { Enum } from './Enum';

const ID = aliasParser('ID', [], ok.String, {
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
