// tslint:disable:no-null-keyword
import YandexTranslate from '../src/index';
import YandexTranslateError from '../src/error';

test('#err', async () => {
    const err1 = new YandexTranslateError('AAA');
    expect(err1).toEqual(expect.objectContaining({message: 'AAA'}));
    expect(err1).toEqual(expect.objectContaining({code: 0}));

    const err2 = new YandexTranslateError({message: 'AAA', code: 123});
    expect(err2).toEqual(expect.objectContaining({message: 'AAA'}));
    expect(err2).toEqual(expect.objectContaining({code: 123}));

    const err3 = new YandexTranslateError({code: 123});
    expect(err3).toEqual(expect.objectContaining({message: 'Something wrong'}));
    expect(err3).toEqual(expect.objectContaining({code: 123}));
});
