import { Guard } from './guard';

export class GuardAssertionError extends Error {
    public context: {
        guard: Guard<any, any>;
        path: any[];
        value: any;
    }[] = [];

    public logged: boolean = false;

    constructor(message: string) {
        super(message);
        this.name = 'GuardAssertion';
    }
}

export function longGuardErrorMessage(error: GuardAssertionError): string {
    const contextReversed = error.context.reverse();
    const fullpath: any[] = [];
    const tracelines: string[] = [];

    const first = contextReversed.length > 0 && contextReversed[0].guard;
    if (first && first.meta.type === 'object') {
        fullpath.push(first.meta.name);
    }

    for (const x of contextReversed) {
        let line = `    ${x.guard.meta.name}`;
        if (x.path.length > 0) {
            line += ' at';
            if (x.path.length > 1) {
                line += ` path ${humanPath(x.path)}`;
            } else if (typeof x.path[0] === 'string') {
                line += ` property "${x.path[0]}"`;
            } else {
                line += ` index ${x.path[0]}`;
            }
        }
        tracelines.push(line);
        fullpath.push(...x.path);
    }
    const trace = tracelines.join('\n');

    const lastvalue = error.context[0].value;
    const lastvaluestr =
        JSON.stringify(lastvalue, null, 2) ?? lastvalue.toString();

    const received = lastvaluestr
        .split('\n')
        .map(x => `    ${x}`)
        .join('\n');

    let long: string[];
    if (fullpath.length > 0) {
        const location = `At ${humanPath(fullpath)}:`;
        long = [
            `${error.name}: ${error.message}\n`,
            location,
            trace + '\n',
            // 'Expected:',
            // expected + '\n',
            'Received:',
            received,
        ];
    } else {
        long = [
            `${error.name}: ${error.message}\n`,
            'At:',
            trace + '\n',
            // 'Expected:',
            // expected + '\n',
            'Received:',
            received,
        ];
    }

    // TODO At printout of expected schema
    /*
    GuardAssertion: unable to reconcile Object with union: isString | isRecordOf

    At tags[1]:
        isObject at property "tags"
        isArrayOf at index 1
        isUnion

    Expected:
        isObject({
            tags: isArrayOf(
                isUnion(isString | isRecordOf)
            ),
            ...
        })

    Received:
        {
            "x": true
        }
    */

    return long.join('\n');
}

function humanPath(path: any[]) {
    const parts: string[] = [];
    for (const x of path) {
        if (typeof x === 'string') {
            if (parts.length > 0) {
                const last = parts[parts.length - 1];
                if (typeof last === 'string') {
                    parts.push('.');
                }
            }
            parts.push(x);
        } else {
            parts.push(`[${x}]`);
        }
    }
    return parts.join('');
}
