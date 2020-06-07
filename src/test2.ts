import { String } from './Primitive';
import { ObjectParser } from './ObjectParser';

class Foo extends ObjectParser {
    foo = String;
}

const x = String.maybe(123);
console.log(x);

const y = Foo.getParser().maybe({ foo: 123 });
console.log(y);
