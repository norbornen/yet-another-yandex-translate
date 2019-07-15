# yet-another-yandex-translate
Yet another Yandex.Translate service client

## Installation

1.  Sign up for a Yandex API key at https://translate.yandex.com/developers/keys

2.  Install this package in your project:

        $ npm install --save yet-another-yandex-translate

3.  Use it:

```
import YandexTranslate from 'yet-another-yandex-translate';

const yt = new YandexTranslate('<< YOUR YANDEX API KEY HERE >>');

const text = 'Привет мир!';

await yt.translate(text, {from: 'ru', to: 'en', format: 'html'}); // Hello world!
await yt.translate([ text, text ], {to: 'fr', format: 'plain'}); // [ 'Bonjour tout le monde!', 'Bonjour tout le monde!' ]

await yt.detect(text);                    // ru
await yt.detect(text, {hint: 'en,fr'});   // ru

await yt.getLangs();
await yt.getLangs({ui: 'en'});            // {dirs: [], langs: {}}
```

## Bugs and features

Please file in GitHub.
