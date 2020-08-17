import { Guard, GuardArg, GuardArgs } from './guard';
import { Schema } from './types/Schema';

export class SchemaBuilder {
    private _schema: Schema = { roots: {}, guards: [] };
    private _index = new Map<Guard<any, any>, number>();

    private makeArgs(args: GuardArgs): Schema.GuardArgs {
        if (Array.isArray(args)) {
            return args.map(x => this.makeArg(x));
        } else {
            const r: { [k: string]: Schema.Arg } = {};
            for (const k in args) {
                r[k] = this.makeArg(args[k]);
            }
            return r;
        }
    }

    private makeArg(arg: GuardArg): Schema.Arg {
        if (typeof arg === 'function') {
            return {
                type: 'guard',
                index: this.add(arg),
            };
        } else {
            return {
                type: 'literal',
                value: arg,
            };
        }
    }

    private addBuiltin(guard: Guard<any, any>): number {
        if (guard.meta.type !== 'builtin') {
            throw Error('expected "builtin" guard');
        }

        let i = this._index.get(guard);
        if (i !== undefined) {
            return i;
        }

        const s: Schema.BuiltinGuard = {
            type: 'builtin',
            name: guard.meta.name,
            args: guard.meta.args && this.makeArgs(guard.meta.args),
        };

        i = this._schema.guards.length;
        this._index.set(guard, i);
        this._schema.guards.push(s);
        return i;
    }

    private addAliased(guard: Guard<any, any>): number {
        if (guard.meta.type !== 'aliased') {
            throw Error('expected "aliased" guard');
        }

        let i = this._index.get(guard);
        if (i !== undefined) {
            return i;
        }

        if (!Array.isArray(guard.meta.args)) {
            throw Error('alias guard arguments must be array');
        } else if (guard.meta.args?.length !== 1) {
            throw Error('alias guards must have exactly one argument');
        }
        const aliased = guard.meta.args[0];
        if (typeof aliased !== 'function') {
            throw Error('the alias guard argument must be a guard');
        }

        const s: Schema.AliasedGuard = {
            type: 'aliased',
            name: guard.meta.name,
            index: this.add(aliased),
        };

        i = this._schema.guards.length;
        this._index.set(guard, i);
        this._schema.guards.push(s);
        this._schema.roots[guard.meta.name] = i;
        return i;
    }

    private addObject(guard: Guard<any, any>): number {
        if (guard.meta.type !== 'object') {
            throw Error('expected "object" guard');
        }

        let i = this._index.get(guard);
        if (i !== undefined) {
            return i;
        }

        const props: { [k: string]: number } = {};
        if (Array.isArray(guard.meta.args) || guard.meta === undefined) {
            throw Error('expected object guard argument to be props object');
        }
        for (const k in guard.meta.args) {
            const arg = guard.meta.args[k];
            if (typeof arg !== 'function') {
                throw Error('expected object guard props to be guards');
            }
            props[k] = this.add(arg);
        }

        const s: Schema.ObjectGuard = {
            type: 'object',
            name: guard.meta.name,
            props,
        };

        i = this._schema.guards.length;
        this._index.set(guard, i);
        this._schema.guards.push(s);
        this._schema.roots[guard.meta.name] = i;
        return i;
    }

    get schema() {
        return this._schema;
    }

    add(guard: any): number {
        if (guard.meta !== undefined) {
            if (guard.meta.type === 'builtin') {
                return this.addBuiltin(guard);
            } else if (guard.meta.type === 'aliased') {
                return this.addAliased(guard);
            } else {
                return this.addObject(guard);
            }
        } else {
            return this.addObject(guard.getGuard());
        }
    }
}
