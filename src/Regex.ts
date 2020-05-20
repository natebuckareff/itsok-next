import { makeParser } from './Parser';

export function Regex<T = never>(pattern: RegExp) {
    return makeParser<string, T>('Regex', [pattern.source], x => {
        if (pattern.test(x)) {
            return x as any;
        }
        throw new Error(`Expected value to match pattern: ${pattern.source}`);
    });
}
