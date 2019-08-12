import * as json from '../src/tools/json';
import random from 'slump';

test('#json1', async () => {
    [
        [1, 2, {}, [], [null], 3, {[Symbol('')]: 'a'}, new Map(), new Date(), 5, {AAA: 'ccc', DSDSDS: 'sdds', 10: 5}],
        {a: 1, b: [2, 3], c: {d: [100, true]}},
        'a', [[]], [{}], [[{}]]
    ].forEach((x) => {
        expect(x).toEqual(json.deserialize(json.serialize(x)));
    });
});

test('#json2', async () => {
    for (let i = 0; i < 50; i++) {
        const x1 = random.array();
        const x2 = random.obj();
        const x3 = random.json();
        expect(x1).toEqual(json.deserialize(json.serialize(x1)));
        expect(x2).toEqual(json.deserialize(json.serialize(x2)));
        expect(x3).toEqual(json.deserialize(json.serialize(x3)));
    }
});
