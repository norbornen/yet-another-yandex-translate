# yet-another-yandex-translate <sup>[![Version Badge][2]][1]</sup>

[![Greenkeeper badge](https://badges.greenkeeper.io/norbornen/yet-another-yandex-translate.svg)](https://greenkeeper.io/)
[![dependency status][5]][6]
[![dev dependency status][7]][8]

Yet another Yandex.Translate service client

## Installation

1.  Sign up for a Yandex API key at https://translate.yandex.com/developers/keys

2.  Install this package in your project:

        $ npm install --save yet-another-yandex-translate

## Usage

```javascript
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

## List of supported languages.

https://yandex.ru/dev/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages

## Bugs and features

Please file in GitHub.

[1]: https://npmjs.org/package/yet-another-yandex-translate
[2]: http://versionbadg.es/norbornen/yet-another-yandex-translate.svg
[5]: https://david-dm.org/norbornen/yet-another-yandex-translate.svg
[6]: https://david-dm.org/norbornen/yet-another-yandex-translate
[7]: https://david-dm.org/norbornen/yet-another-yandex-translate/dev-status.svg
[8]: https://david-dm.org/norbornen/yet-another-yandex-translate?type=dev
