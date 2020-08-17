export interface Newtype<Tag, A> {
    readonly _Tag: Tag;
    readonly _A: A;
}

export namespace Newtype {
    export function unwrap<N extends Newtype<any, any>>(t: N): N['_A'] {
        return t as N['_A'];
    }
}
