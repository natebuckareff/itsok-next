import * as ok from './Primitive';
import { Class, ClassT } from './Class';
import { aliasParser } from './Alias';

const ID = aliasParser('ID', [], ok.String, {
    'postgres.type': 'primary_key',
});

class User extends Class {
    id = ID;
    username = ok.String;
    nothing = ok.Null;
}

// console.log(User.getParser().spec);
// console.log(ID.spec);

const i: ClassT<User> = {
    id: '42',
    username: 'alice',
    nothing: null,
};
const x = User.parse(i);
console.log(x);
console.log(x === i);
