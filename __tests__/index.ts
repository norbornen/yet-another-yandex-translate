/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/await-thenable */
import YandexTranslate from '../src/index';
import YandexTranslateError from '../src/error';

class YandexTranslateTimed extends YandexTranslate {
    protected timeout = 15;
}

const translateKey = 'trnsl.1.1.20131018T175412Z.6e9fa29e525b4697.3542f82ffa6916d1ccd64201d8a72c023892ae5e';
const yt = new YandexTranslate(translateKey);
const yt2 = new YandexTranslateTimed(translateKey);


beforeEach(() => {
    jest.setTimeout(40000);
});

test('#err', async () => {
    expect.assertions(2);
    const mtchs = await expect(new YandexTranslate(`${translateKey}1`).getLangs()).rejects;
    await mtchs.toThrow(YandexTranslateError);
    await mtchs.toEqual(expect.objectContaining({ code: 401 }));
});

test('#translate-text', async () => {
    expect.assertions(2);

    let text = 'expect';
    await expect(yt.translate(text, { from: 'ru', to: 'en' })).resolves.toEqual(text);

    text = `<span>${text}</span>`;
    await expect(yt.translate(text, { from: 'ru', to: 'en', format: 'html' })).resolves.toEqual(text);
});

test('#translate-text', async () => {
    expect.assertions(6);
    for (const x of ['', null, undefined, false, Symbol(), [new Map()]]) {
        await expect(yt.translate(x, { to: 'en' })).resolves.toEqual(x);
    }
});

test('#translate-html', async () => {
    const text = 'span';
    const data_plain = await yt.translate(text, { from: 'en', to: 'ru' });
    const data_html = await yt.translate(`<${text}>${text}</${text}>`, { from: 'en', to: 'ru', format: 'html' });
    expect(data_plain).not.toEqual(data_html);
});

test('#translate-array', async () => {
    expect.assertions(3);
    const text = 'expect';
    await expect(yt.translate([text, null, undefined, text], { from: 'ru', to: 'en' })).resolves.toEqual([text, null, undefined, text]);
    await expect(yt.translate([], { to: 'en' })).resolves.toEqual([]);
    await expect(yt.translate(['', null, undefined, ''], { to: 'en' })).resolves.toEqual(['', null, undefined, '']);
});

test('#translate-err', async () => {
    expect.assertions(3);
    await expect(yt.translate('test', null)).rejects.toThrow(YandexTranslateError);
    await expect(yt.translate('test', { to: null })).rejects.toThrow(YandexTranslateError);
    await expect(yt2.translate('test', { to: 'en' })).rejects.toThrow(Error);
});

test('#translate-multi', async () => {
    const text = 'test';
    const to = ['fr', 'de', 'en'];
    await expect(yt.translate(text, { to })).resolves.toEqual(to.map((lang) => ({ lang, text })));
});

test('#translate-multi-array', async () => {
    const text = ['test', 'test'];
    const to = ['fr', 'de', 'en'];
    await expect(yt.translate(text, { to })).resolves.toEqual(to.map((lang) => ({ lang, text })));
});

test('#translate-multi-err', async () => {
    expect.assertions(4);

    const res = await yt.translate('Привет мир!', { to: ['xx'] });
    expect('error' in res[0]).toBe(true);
    expect(res[0]['error'] instanceof YandexTranslateError).toBe(true);
    expect(res[0]['error']['code']).toBe(501);

    await expect(yt.translate('Привет мир!', { to: [['xx'] as unknown as string] })).rejects.toThrow(YandexTranslateError);
});

test('#translate-json', async () => {
    expect.assertions(2);
    await expect(yt.translate({}, { to: 'en' })).resolves.toEqual({});

    const test = {
        key1: [false, { a: { b: { c: ['Hello 1'] } } }],
        key2: 'Hello 2',
        key3: [false, 'Hello 2', true, 'Hello 1', null],
        key4: 123,
        Привет: [{ d: 'Hello 2' }],
    };
    await expect(yt.translate(test, { to: 'en' })).resolves.toEqual(test);
});

test('#translate-json-multi', async () => {
    expect.assertions(2);

    const test = {
        key1: [false, { a: { b: { c: ['Hello 1'] } } }],
        key2: 'Hello 2',
        key3: [false, 'Hello 2', true, 'Hello 1', null],
        key4: 123,
        Привет: [{ d: 'Hello 2' }],
    };
    const res = await yt.translate(test, { to: ['en', 'en'] });
    expect(res[0]['text']).toEqual(test);
    expect(res[1]['text']).toEqual(test);
});

test('#detect', async () => {
    expect.assertions(5);
    await expect(yt.detect('expect')).resolves.toEqual('en');
    await expect(yt.detect('переводчик', { hint: 'hy,az' })).resolves.toEqual('ru');
    await expect(yt.detect('')).resolves.toBeUndefined();
    await expect(yt.detect(null)).resolves.toBeUndefined();
    await expect(yt.detect(undefined)).resolves.toBeUndefined();
});

test('#detect-multi', async () => {
    expect.assertions(1);
    const text = ['expect', 'переводчик', 'merci', 'expect', 'переводчик', 'merci'];
    await expect(yt.detect(text)).resolves.toHaveLength(text.length);
});

test('#detect-json', async () => {
    expect.assertions(4);

    const test = {
        key1: 'Hello 1',
        key2: 'Hello 2',
        key3: [false, 'Hello 2', true, 'Hello 1', null],
        key4: 123,
    };
    await expect(yt.detect(test)).resolves.toEqual('en');
    await expect(yt.detect(['expect', ['1'], 'merci'])).resolves.toEqual('en');
    await expect(yt.detect({})).resolves.toBeUndefined();
    await expect(yt.detect({ a: 1 })).resolves.toBeUndefined();
});

test('#detect-err', async () => {
    expect.assertions(1);

    const res = await yt2.detect(['expect', 'expect']);
    expect(res[0]['error'] instanceof Error).toBe(true);
});

test('#getLangs', async () => {
    expect.assertions(7);

    let data = await yt.getLangs();
    expect(typeof data).toBe('object');
    expect('dirs' in data).toBe(true);
    expect(data.dirs.length > 0).toBe(true);
    expect(data.dirs).toEqual(expect.arrayContaining(['ru-en']));

    data = await yt.getLangs({ ui: 'en' });
    expect(typeof data).toBe('object');
    expect('langs' in data).toBe(true);
    expect(data.langs).toEqual(expect.objectContaining({ en: 'English' }));
});
