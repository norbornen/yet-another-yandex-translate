// import { strict as assert } from 'assert';
import YandexTranslate from '../src/index';

const translateKey = 'trnsl.1.1.20131018T175412Z.6e9fa29e525b4697.3542f82ffa6916d1ccd64201d8a72c023892ae5e';
const yt = new YandexTranslate(translateKey);

test('#getLangs0', async () => {
    const data = await yt.getLangs();
    // expect(data). dirs
    // console.log('res0', JSON.stringify(res, undefined, 2));
});

test('#getLangs1', async () => {
    const data = await yt.getLangs({ui: 'en'});
    // dirs langs
    // console.log('res1', JSON.stringify(res, undefined, 2));
    // expect(1 + 2).toBe(4);
});

test('#translate', async () => {
    // await yt.translate(text, {from: 'ru', to: 'sr', format: 'html'});
});

test('#translate', async () => {
    // await yt.translate([ text, text3, text2 ], {from: 'ru', to: 'sr', format: 'html'});
});

test('#translate', async () => {
    // await yt.translate(text3, {from: 'ru', to: 'sr'});
});

test('#translate', async () => {
    // await yt.translate([], {from: 'ru', to: 'sr', format: 'html'});
});

test('#translate', async () => {
    // fail -> await yt.translate({} as string[], {from: 'ru', to: 'sr', format: 'html'});
});

test('#detect0', async () => {
    // await yt.detect(text4);
});

test('#detect1', async () => {
    // await yt.detect(text4, {hint: 'en,fr'});
});
