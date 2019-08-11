function deserialize(raw) {
    if (!raw || !raw[0]) {
        return null;
    }
    const dest = Array.isArray(raw[0][0]) ? [] : {};
    raw.forEach((nodes) => {
        let acc = dest;
        while (nodes.length > 0) {
            const node = nodes.shift();
            const key = Array.isArray(node) ? node[0] : node;
            acc[key] = nodes.length === 1 ? nodes.pop() : acc[key] || (Array.isArray(nodes[0]) ? [] : {});
            acc = acc[key];
        }
    });
    return dest;
}

function serialize(x, acc = []) {
    if (x === null || x === undefined || typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') {
        acc[ 0 ].push(x);
    } else {
        if (Array.isArray(x)) {
            if (x.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = [].concat( ...x.map((xx, idx) => serialize(xx, [[...(acc[0] || []), [idx]]])) );
            }
        } else if (typeof x[Symbol.iterator] === 'function') {
            const entries = Array.from(x);
            if (entries.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = [].concat( ...Array.from(x).map(([key, value]) => serialize(value, [[...(acc[0] || []), key]])) );
            }
        } else {
            const keys = Object.keys(x);
            if (keys.length === 0) {
                acc[ 0 ].push(x);
            } else {
                acc = [].concat( ...keys.map((key) => serialize(x[key], [[...(acc[0] || []), key]])) );
            }
        }
    }
    return acc;
}

export { serialize, deserialize };
