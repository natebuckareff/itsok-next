interface MemoNode<V> {
    val?: V;
    map?: Map<any, MemoNode<V>>;
}

export class MemoMap<K extends any[], V> {
    private root: MemoNode<V> = {
        map: new Map<any, MemoNode<V>>(),
    };

    getLeafMap(keys: K): MemoNode<V> {
        let node = this.root;
        let i = 0;
        for (; i < keys.length - 1; ++i) {
            let k = keys[i];
            if (node.map === undefined) {
                node.map = new Map();
            }
            let r = node.map.get(k);
            if (r === undefined) {
                r = { map: new Map() };
                node.map.set(k, r);
            }
            node = r;
        }
        return node;
    }

    has(keys: K): boolean {
        const key = keys[keys.length - 1];
        return !!this.getLeafMap(keys).map?.has(key);
    }

    get(keys: K): V | undefined {
        const key = keys[keys.length - 1];
        return this.getLeafMap(keys).map?.get(key)?.val;
    }

    set(keys: K, val: V): void {
        const node = this.getLeafMap(keys);
        const key = keys[keys.length - 1];
        if (node.map === undefined) {
            node.map = new Map();
        }
        node.map.set(key, { val });
    }

    delete(keys: K): boolean {
        const node = this.getLeafMap(keys);
        if (node.map === undefined) {
            return false;
        } else {
            const key = keys[keys.length - 1];
            return node.map.delete(key);
        }
    }

    clear() {
        if (this.root.map !== undefined) {
            this.root.map.clear();
        }
    }
}
