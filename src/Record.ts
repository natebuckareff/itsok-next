import { parse, makeParser, EveryParser, EveryParserT } from './Parser';

export type RecordP = { [k: string]: EveryParser };

export type RecordT<P extends RecordP> = {
    [K in keyof P]: EveryParserT<P[K]>['O'];
};

// TODO Can this code be shared between Record and Object?
export function Record<P extends RecordP>(obj: P, strict = true) {
    return makeParser<any, RecordT<P>>('Record', [], input => {
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                try {
                    parse(obj[k], input[k]);
                } catch (error) {
                    if (input[k] === undefined) {
                        throw new Error(`Missing property "${k}"`);
                    } else {
                        throw new Error(
                            `Failed to parse value for property "${k}"`,
                        );
                    }
                }
            }
        }

        if (strict) {
            for (const k in input) {
                if (input.hasOwnProperty(k)) {
                    if (obj[k] === undefined) {
                        throw new Error(`Unknown property "${k}"`);
                    }
                }
            }
        }
        return input;
    });
}
