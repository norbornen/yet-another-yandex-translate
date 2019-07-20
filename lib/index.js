"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const error_1 = __importDefault(require("./error"));
const stringify_1 = __importDefault(require("./tools/stringify"));
var ETranslateFormat;
(function (ETranslateFormat) {
    ETranslateFormat["html"] = "html";
    ETranslateFormat["plain"] = "plain";
})(ETranslateFormat || (ETranslateFormat = {}));
class YandexTranslate {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = YandexTranslate.initClient();
    }
    async translate(text, opts) {
        if (!YandexTranslate.isValid(text) || !opts) {
            throw new error_1.default('INVALID_PARAM');
        }
        if (YandexTranslate.isEmpty(text) || !opts.to) {
            return text; // empty string -> empty string; empty array -> empty array
        }
        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || ETranslateFormat.plain;
        const data = await this.request('translate', { lang, text, format });
        if (!data || ('code' in data && data.code !== 200) || !('text' in data)) {
            throw new error_1.default(data);
        }
        const outputText = data.text;
        return (Array.isArray(text) ? outputText : outputText[0]);
    }
    async detect(text, opts) {
        if (!YandexTranslate.isValid(text)) {
            throw new error_1.default('INVALID_PARAM');
        }
        if (YandexTranslate.isEmpty(text)) {
            return;
        }
        const data = await this.request('detect', { text, ...opts });
        if (!data || ('code' in data && data.code !== 200) || !('lang' in data)) {
            throw new error_1.default(data);
        }
        return data.lang;
    }
    async getLangs(opts) {
        const data = await this.request('getLangs', opts);
        if (!data || ('code' in data && data.code !== 200)) {
            throw new error_1.default(data);
        }
        return data;
    }
    async request(endpoint, params) {
        const { data } = await this.client.post(endpoint, { key: this.apiKey, ...params });
        return data;
    }
    static initClient() {
        const client = axios_1.default.create({
            baseURL: YandexTranslate.baseURL,
            timeout: 30 * 1000,
            headers: {
                'User-Agent': 'YetAnotherYandexTranslateClient',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });
        client.interceptors.request.use((request) => {
            if (request.headers['Content-Type'] === 'application/x-www-form-urlencoded' && request.data) {
                request.data = stringify_1.default(request.data);
            }
            return request;
        });
        client.interceptors.response.use(undefined, (err) => {
            if ('response' in err && err.response && 'data' in err.response) {
                console.error('An error occured while translating: ', err.response.data);
                throw new error_1.default(err.response.data);
            }
            console.error('An error occured while translating: ', err);
            throw err;
        });
        return client;
    }
    static isValid(x) {
        if (typeof x === 'string') {
            return true;
        }
        if (Array.isArray(x)) {
            return !x.some((o) => !(typeof o === 'string' || o === null || o === undefined));
        }
        return false;
    }
    static isEmpty(x) {
        if (Array.isArray(x)) {
            return !x.some((xx) => !YandexTranslate.isEmpty(xx));
        }
        else {
            return x === null || x === undefined || !/\S/.test(x);
        }
    }
}
YandexTranslate.baseURL = 'https://translate.yandex.net/api/v1.5/tr.json/';
exports.default = YandexTranslate;
//# sourceMappingURL=index.js.map