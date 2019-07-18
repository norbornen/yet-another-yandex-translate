// tslint:disable:no-null-keyword
import YandexTranslate from '../src/index';
import YandexTranslateError from '../src/error';

const translateKey = 'trnsl.1.1.20131018T175412Z.6e9fa29e525b4697.3542f82ffa6916d1ccd64201d8a72c023892ae5e';
const yt = new YandexTranslate(translateKey);

beforeEach(() => {
    jest.setTimeout(40000);
});

test('#translate', async () => {
    let text = 'expect';
    let data = await yt.translate(text, {from: 'ru', to: 'en'});
    expect(typeof data).toBe('string');
    expect(data).toEqual(text);

    text = `<span>${text}</span>`;
    data = await yt.translate(text, {from: 'ru', to: 'en', format: 'html'});
    expect(typeof data).toBe('string');
    expect(data).toEqual(text);
});

test('#translate', async () => {
    const text = 'expect';
    const data = await yt.translate([ text, null, text ], {from: 'ru', to: 'en'});
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([ text, '', text ]);
});

// test('#translate-multy', async () => {
    // let text = 'expect';
    // let data = await yt.translate(text, {from: 'ru', to: ['en', 'en']});
    // expect(typeof data).toBe('string');
    // expect(data).toEqual(text);

    // text = `<span>${text}</span>`;
    // data = await yt.translate(text, {to: ['en', 'en'], format: 'html'});
    // expect(typeof data).toBe('string');
    // expect(data).toEqual(text);
// });

// test('#translate-multy', async () => {
    // // tslint:disable:no-null-keyword
    // const text = 'expect';
    // const data = await yt.translate([ text, null, text ], {from: 'ru', to: 'en'});
    // expect(Array.isArray(data)).toBe(true);
    // expect(data).toEqual([ text, '', text ]);
// });

test('#translate-err', async () => {
    expect.assertions(3);
    await expect(yt.translate(null, {to: 'en'})).resolves.toEqual(undefined);
    await expect(yt.translate([], {to: 'en'})).resolves.toEqual(undefined);
    await expect(yt.translate({} as string[], {to: 'en'})).rejects.toThrow(YandexTranslateError);
});

test('#detect', async () => {
    expect.assertions(4);
    await expect(yt.detect('expect')).resolves.toEqual('en');
    await expect(yt.detect('переводчик', {hint: 'sr,az'})).resolves.toEqual('ru');
    await expect(yt.detect(null)).resolves.toEqual(undefined);
    await expect(yt.detect('')).resolves.toEqual(undefined);
});

test('#detect-err', async () => {
    expect.assertions(1);
    await expect(yt.detect({a: 1} as unknown as string)).rejects.toThrow(YandexTranslateError);
});

test('#getLangs', async () => {
    let data = await yt.getLangs();
    expect(typeof data).toBe('object');
    expect('dirs' in data).toBe(true);
    expect(data.dirs.length > 0).toBe(true);
    expect(data.dirs).toEqual(expect.arrayContaining(['ru-en']));

    data = await yt.getLangs({ui: 'en'});
    expect(typeof data).toBe('object');
    expect('langs' in data).toBe(true);
    expect(data.langs).toEqual(expect.objectContaining({en: 'English'}));
});
