function deserialize(raw: any[] = []) {
    let dest: any;
    raw.forEach((nodes: any[] = []) => {
        let acc = dest || (dest = nodes.length === 1 ? nodes.pop() : Array.isArray(nodes[0]) ? [] : {});
        while (nodes.length > 0) {
            const node = nodes.shift();
            const key = Array.isArray(node) ? node[0] : node;
            acc[key] = nodes.length === 1 ? nodes.pop() : acc[key] || (Array.isArray(nodes[0]) ? [] : {});
            acc = acc[key];
        }
    });
    return dest;
}

function serialize(x: any, acc: any[][] = [[]], seen: any[] = []): any[][] {
    if (x === null || x === undefined || typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') {
        acc[ 0 ].push(x);
    } else {
        if (Array.isArray(x)) {
            if (x.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = ([] as any[][]).concat( ...x.map((xx, idx) => serialize(xx, [[...(acc[0] || []), [idx]]], seen)) );
            }
        } else if (typeof x[Symbol.iterator] === 'function') {
            const iterable_arr: [any, any][] = Array.from(x);
            if (iterable_arr.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = ([] as any[][]).concat( ...iterable_arr.map(([key, value]) => serialize(value, [[...(acc[0] || []), key]], seen)) );
            }
        } else {
            if (seen.indexOf(x) !== -1) {
                throw new TypeError('Converting circular structure to JSON');
            }
            seen.push(x);

            const keys = Object.keys(x);
            if (keys.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = ([] as any[][]).concat( ...keys.map((key) => serialize(x[key], [[...(acc[0] || []), key]], seen)) );
            }
        }
    }
    return acc;
}

export { serialize, deserialize };
