# yet-another-yandex-translate [![Build Status](https://travis-ci.org/norbornen/yet-another-yandex-translate.svg?branch=master)](https://travis-ci.org/norbornen/yet-another-yandex-translate) [![Greenkeeper badge](https://badges.greenkeeper.io/norbornen/yet-another-yandex-translate.svg)](https://greenkeeper.io/)

Translate any type of data (string, string[], json) into one or more languages.

## Installation

1.  Sign up for a Yandex API key at https://translate.yandex.com/developers/keys

2.  Install this [package](https://npmjs.org/package/yet-another-yandex-translate) in your project:

        $ npm install --save yet-another-yandex-translate

## Adding to your project

### In Node.js

Call require to get the instance:
```js
const { YandexTranslate } = require('yet-another-yandex-translate');
```

Or in ES6 and TS:
```typescript
import YandexTranslate from 'yet-another-yandex-translate';
```

## Usage
```typescript
const yt = new YandexTranslate('<< YOUR YANDEX API KEY HERE >>');
```
### Translate

Translate any type of data (string, string[], json) into one or more languages:

```typescript
// Hello world!
await yt.translate('Привет мир!', {from: 'ru', to: 'en', format: 'html'});

// [ 'foo', 'bar' ]
await yt.translate([ 'foo', 'bar' ], {to: 'en', format: 'plain'});

// [{text: 'Hello world!', lang: 'en'}, {text: 'Bonjour tout le monde!', lang: 'fr'}]
await yt.translate('Привет мир!', {to: ['en', 'fr']});

// [{text: ['Hello world!', 'Hello world!'], lang: 'en'}, {text: ['Bonjour tout le monde!', 'Bonjour tout le monde!'], lang: 'fr'}]
await yt.translate(['Привет мир!', 'Привет мир!'], {to: ['en', 'fr']});   

// {
//   key1: 'Hello 1',
//   key2: 'hi 2',
//   key3: [ false, 'Hello 1', true, 'hi 2', null ],
//   key4: 123,
//   привет: [ 'hi 4' ]
// }
const test = {
    key1: 'привет 1',
    key2: 'привет 2',
    key3: [false, 'привет 1', true, 'привет 2', null],
    key4: 123,
    привет: ['привет 4']
};
await yt.translate(text, {to: 'en'});
```

### Detect the language
Detects the language of the specified any type of data (string, string[], json).

```typescript
// ru
await yt.detect('Привет мир!');

// ru
await yt.detect('Привет мир!', {hint: 'en,fr'});

// ru
await yt.detect(test, {hint: 'en,fr'});

// [{lang: 'ru'}, {lang: 'en'}]
await yt.detect(['Привет мир!', 'Hello world!']);
```

### Get the list of supported languages
```typescript
// {dirs: [], langs: {}}
await yt.getLangs();
await yt.getLangs({ui: 'en'});
```

## Yandex Translate

[Demo](https://translate.yandex.com/) | [Docs](https://tech.yandex.com/translate/) | [List of supported languages](https://yandex.ru/dev/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages) | [API Key](https://translate.yandex.com/developers/keys) | [Statistics](https://translate.yandex.com/developers/stat)




