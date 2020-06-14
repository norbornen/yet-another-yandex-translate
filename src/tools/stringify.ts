export default (data: { [key: string]: any }): string => {
    return Object.keys(data || {}).reduce<string[]>((acc, k) => {
        let v = data[ k ];
        if (v !== null && v !== undefined) {
            if (Array.isArray(v)) {
                acc = acc.concat(v.map((o) => `${k}=${o !== null && o !== undefined ? encodeURIComponent(o) : ''}`));
            } else {
                if (typeof v === 'object') {
                    v = JSON.stringify(v);
                }
                acc.push(`${k}=${encodeURIComponent(v)}`);
            }
        }
        return acc;
    }, []).join('&');
};
