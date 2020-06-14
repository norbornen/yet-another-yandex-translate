import YandexTranslateError from '../src/error';

test('#err', async () => {
    expect.assertions(6);

    const err1 = new YandexTranslateError('AAA');
    expect(err1).toStrictEqual(expect.objectContaining({ message: 'AAA' }));
    expect(err1).toStrictEqual(expect.objectContaining({ code: 0 }));

    const err2 = new YandexTranslateError({ message: 'AAA', code: 123 });
    expect(err2).toStrictEqual(expect.objectContaining({ message: 'AAA' }));
    expect(err2).toStrictEqual(expect.objectContaining({ code: 123 }));

    const err3 = new YandexTranslateError({ code: 123 });
    expect(err3).toStrictEqual(expect.objectContaining({ message: 'Something wrong' }));
    expect(err3).toStrictEqual(expect.objectContaining({ code: 123 }));
});
