// tslint:disable:no-null-keyword
import * as json from '../src/tools/json';

test('#json1', async () => {
    [
        [1, 2, {}, [], [null], 3, {[Symbol('')]: 'a'}, new Map(), new Date(), 5, {AAA: 'ccc', DSDSDS: 'sdds', 10: 5}],
        {a: 1, b: [2, 3], c: {d: [100, true]}}
    ].forEach((x) => {
        expect(x).toEqual(json.deserialize(json.serialize(x)));
    });
});
