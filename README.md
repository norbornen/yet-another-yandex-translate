# yet-another-yandex-translate

[![Build Status](https://travis-ci.org/norbornen/yet-another-yandex-translate.svg?branch=master)](https://travis-ci.org/norbornen/yet-another-yandex-translate)
[![dependency status][1]][2]
[![Greenkeeper badge](https://badges.greenkeeper.io/norbornen/yet-another-yandex-translate.svg)](https://greenkeeper.io/)

Yet another Yandex.Translate service client

## Installation

1.  Sign up for a Yandex API key at https://translate.yandex.com/developers/keys

2.  Install this [package](https://npmjs.org/package/yet-another-yandex-translate) in your project:

        $ npm install --save yet-another-yandex-translate

## Usage

###### Nodejs require
```javascript
const { YandexTranslate } = require('yet-another-yandex-translate');
```

###### Typescript import
```typescript
import YandexTranslate from 'yet-another-yandex-translate';
```


```typescript
const yt = new YandexTranslate('<< YOUR YANDEX API KEY HERE >>');

const text = 'Привет мир!';

(async () => {

    // Hello world!
    await yt.translate(text, {from: 'ru', to: 'en', format: 'html'});

    // [ 'Hello world!', 'Hello world!' ]
    await yt.translate([ text, text ], {to: 'en', format: 'plain'});

    // [{text: 'Hello world!', lang: 'en'}, {text: 'Bonjour tout le monde!', lang: 'fr'}]
    await yt.translate(text, {to: ['en', 'fr']});

    // [{text: ['Hello world!', 'Hello world!'], lang: 'en'}, {text: ['Bonjour tout le monde!', 'Bonjour tout le monde!'], lang: 'fr'}]
    await yt.translate([text, text], {to: ['en', 'fr']});   


    // ru
    await yt.detect(text);

    // ru
    await yt.detect(text, {hint: 'en,fr'});

    // [{lang: 'ru'}, {lang: 'en'}]
    await yt.detect(['Привет мир!', 'Hello world!']); 


    await yt.getLangs();
    await yt.getLangs({ui: 'en'}); // {dirs: [], langs: {}}

})();

```

## Yandex Translate

[Demo](https://translate.yandex.com/) | [Docs](https://tech.yandex.com/translate/) | [List of supported languages](https://yandex.ru/dev/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages) | [API Key](https://translate.yandex.com/developers/keys) | [Statistics](https://translate.yandex.com/developers/stat)


[1]: https://david-dm.org/norbornen/yet-another-yandex-translate.svg
[2]: https://david-dm.org/norbornen/yet-another-yandex-translate

