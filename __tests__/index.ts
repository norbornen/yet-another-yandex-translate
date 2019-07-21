// tslint:disable:no-null-keyword
import YandexTranslate from '../src/index';
import YandexTranslateError from '../src/error';

const translateKey = 'trnsl.1.1.20131018T175412Z.6e9fa29e525b4697.3542f82ffa6916d1ccd64201d8a72c023892ae5e';
const yt = new YandexTranslate(translateKey);

beforeEach(() => {
    jest.setTimeout(40000);
});


test('#err', async () => {
    expect.assertions(2);
    const mtchs = await expect(new YandexTranslate(`${translateKey}1`).getLangs()).rejects;
    await mtchs.toThrow(YandexTranslateError);
    await mtchs.toEqual(expect.objectContaining({code: 401}));
});

test('#translate-text', async () => {
    expect.assertions(2);

    let text = 'expect';
    await expect(yt.translate(text, {from: 'ru', to: 'en'})).resolves.toEqual(text);

    text = `<span>${text}</span>`;
    await expect(yt.translate(text, {from: 'ru', to: 'en', format: 'html'})).resolves.toEqual(text);
});

test('#translate-text', async () => {
    expect.assertions(3);
    await expect(yt.translate('', {to: 'en'})).resolves.toEqual('');
    await expect(yt.translate(null, {to: 'en'})).resolves.toEqual(null);
    await expect(yt.translate(undefined, {to: 'en'})).resolves.toEqual(undefined);
});

test('#translate-html', async () => {
    const text = 'span';
    const data_plain = await yt.translate(text, {from: 'en', to: 'ru'});
    const data_html = await yt.translate(`<${text}>${text}</${text}>`, {from: 'en', to: 'ru', format: 'html'});
    expect(data_plain).not.toEqual(data_html);
});

test('#translate-array', async () => {
    expect.assertions(1);
    const text = 'expect';
    await expect(yt.translate([ text, null, undefined, text ], {from: 'ru', to: 'en'})).resolves.toEqual([ text, '', '', text ]);
});

test('#translate-array', async () => {
    expect.assertions(2);
    await expect(yt.translate([], {to: 'en'})).resolves.toEqual([]);
    await expect(yt.translate(['', null, undefined, ''], {to: 'en'})).resolves.toEqual(['', null, undefined, '']);
});

test('#translate-err', async () => {
    expect.assertions(3);
    await expect(yt.translate('test', null)).rejects.toThrow(YandexTranslateError);
    await expect(yt.translate('test', {to: null})).resolves.toEqual('test');
    await expect(yt.translate({} as unknown as string[], {to: 'en'})).rejects.toThrow(YandexTranslateError);
});

test('#detect', async () => {
    expect.assertions(5);
    await expect(yt.detect('expect')).resolves.toEqual('en');
    await expect(yt.detect('переводчик', {hint: 'sr,az'})).resolves.toEqual('ru');
    await expect(yt.detect('')).resolves.toEqual(undefined);
    await expect(yt.detect(null)).resolves.toEqual(undefined);
    await expect(yt.detect(undefined)).resolves.toEqual(undefined);
});

test('#detect-multi', async () => {
    expect.assertions(1);
    const text = ['expect', 'переводчик', 'merci', 'expect', 'переводчик', 'merci'];
    await expect(yt.detect(text)).resolves.toHaveLength(text.length);
});

test('#detect-err', async () => {
    expect.assertions(2);
    await expect(yt.detect({} as unknown as string)).rejects.toThrow(YandexTranslateError);
    await expect(yt.detect(['expect', ['1'] as unknown as string, 'merci'])).rejects.toThrow(YandexTranslateError);
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
