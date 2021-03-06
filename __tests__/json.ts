import * as json from '../src/tools/json';
import { promisify } from 'util';
import { readdir, readFile } from 'fs';

test('#json-circular-error', async () => {
    expect.assertions(1);

    const circular: { [key: string]: any } = { a: 1, b: [2, 3], c: { d: [100, true] } };
    circular.q = circular.c;
    circular.c.q = circular.q;
    expect(() => json.serialize(circular)).toThrow(TypeError);
});

// eslint-disable-next-line jest/prefer-expect-assertions
test('#json1', async () => {
    const stubs: any[] = [
        [1, 2, {}, [], [null], 3, { [Symbol('')]: 'a' }, new Map(), new Date(), 5, { AAA: 'ccc', DSDSDS: 'sdds', 10: 5 }],
        { a: 1, b: [2, 3], c: { d: [100, true] } },
        'a', [[]], [{}], [[{}]], true, false,
    ];
    expect.assertions(stubs.length);

    stubs.forEach((x) => {
        expect(x).toStrictEqual(json.deserialize(json.serialize(x)));
    });
});

// eslint-disable-next-line jest/prefer-expect-assertions
test('#json2', async () => {
    const pReaddir = promisify(readdir);
    const pReadFile = promisify(readFile);

    const dir = `${__dirname}/fixtures`;
    const files = await pReaddir(dir);

    expect.assertions(files.length);
    for (const f of files) {
        const data = await pReadFile(`${dir}/${f}`, { encoding: 'utf8' }).then((rawData) => JSON.parse(rawData));
        expect(data).toStrictEqual(json.deserialize(json.serialize(data)));
    }
});
