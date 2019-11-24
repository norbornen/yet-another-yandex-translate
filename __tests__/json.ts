import * as json from '../src/tools/json';
import random from 'slump';

test('#json-circular-error', async () => {
    expect.assertions(1);

    const circular: {[key: string]: any} = {a: 1, b: [2, 3], c: {d: [100, true]}};
    circular.q = circular.c;
    circular.c.q = circular.q;
    expect(() => json.serialize(circular)).toThrow(TypeError);
});

test('#json1', async () => {
    const stubs: any[] = [
        [1, 2, {}, [], [null], 3, {[Symbol('')]: 'a'}, new Map(), new Date(), 5, {AAA: 'ccc', DSDSDS: 'sdds', 10: 5}],
        {a: 1, b: [2, 3], c: {d: [100, true]}},
        'a', [[]], [{}], [[{}]], true, false
    ];
    expect.assertions(stubs.length);

    stubs.forEach((x) => {
        expect(x).toEqual(json.deserialize(json.serialize(x)));
    });
});

test('#json2', async () => {
    expect.assertions(50 * 3);

    for (let i = 0; i < 50; i++) {
        const x1 = random.array();
        const x2 = random.obj();
        const x3 = random.json();
        expect(x1).toEqual(json.deserialize(json.serialize(x1)));
        expect(x2).toEqual(json.deserialize(json.serialize(x2)));
        expect(x3).toEqual(json.deserialize(json.serialize(x3)));
    }
});
