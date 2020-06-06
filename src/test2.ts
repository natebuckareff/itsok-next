import { String } from './Primitive';
import { Enum } from './Enum';

const x = Enum({
    None: null,
    Some: String,
});

x({ type: 'None' });
