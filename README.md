# yet-another-yandex-translate <sup>[![Version Badge][2]][1]</sup>

[![Coverage Status](https://coveralls.io/repos/github/norbornen/yet-another-yandex-translate/badge.svg?branch=master)](https://coveralls.io/github/norbornen/yet-another-yandex-translate?branch=master)
[![dependency status][5]][6]
[![dev dependency status][7]][8]
[![Greenkeeper badge](https://badges.greenkeeper.io/norbornen/yet-another-yandex-translate.svg)](https://greenkeeper.io/)

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

// Hello world!
await yt.translate(text, {from: 'ru', to: 'en', format: 'html'});

// [ 'Hello world!', 'Hello world!' ]
await yt.translate([ text, text ], {to: 'en', format: 'plain'});

// [{text: 'Hello world!', lang: 'en'}, {text: 'Bonjour tout le monde!', lang: 'fr'}]
await yt.translate('Привет мир!', {to: ['en', 'fr']});

// [{text: ['Hello world!', 'Hello world!'], lang: 'en'}, {text: ['Bonjour tout le monde!', 'Bonjour tout le monde!'], lang: 'fr'}]
await yt.translate(['Привет мир!', 'Привет мир!'], {to: ['en', 'fr']});   


// ru
await yt.detect(text);

// ru
await yt.detect(text, {hint: 'en,fr'});

// [{lang: 'ru'}, {lang: 'en'}]
await yt.detect(['Привет мир!', 'Hello world!']); 


await yt.getLangs();
await yt.getLangs({ui: 'en'}); // {dirs: [], langs: {}}
```

## Bugs and features

Please file in GitHub.

## Yandex Translate

[Demo](https://translate.yandex.com/) | [Docs](https://tech.yandex.com/translate/) | [List of supported languages](https://yandex.ru/dev/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages) | [API Key](https://translate.yandex.com/developers/keys) | [Statistics](https://translate.yandex.com/developers/stat)


[1]: https://npmjs.org/package/yet-another-yandex-translate
[2]: http://versionbadg.es/norbornen/yet-another-yandex-translate.svg
[5]: https://david-dm.org/norbornen/yet-another-yandex-translate.svg
[6]: https://david-dm.org/norbornen/yet-another-yandex-translate
[7]: https://david-dm.org/norbornen/yet-another-yandex-translate/dev-status.svg
[8]: https://david-dm.org/norbornen/yet-another-yandex-translate?type=dev
