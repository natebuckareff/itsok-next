// TODO Thinking of getting rid of this and making it possible to create
// newtypes directly with `makeParser`

export interface Newtype<Tag, A> {
    readonly _Tag: Tag;
    readonly _A: A;
}

export function unwrap<N extends Newtype<any, any>>(t: N): N['_A'] {
    return t as N['_A'];
}
