import PQueue, { Queue, Options, QueueAddOptions } from 'p-queue';
import { AxiosInstance } from 'axios';
import YandexTranslateError from './error';
import createHttpAgent from './tools/agent';
import * as json from './tools/json';

// --
type PQueueOptions = Options<Queue<QueueAddOptions>, QueueAddOptions>;

// -- options
enum TranslateFormat {
    html = 'html',
    plain = 'plain'
}

type OptionsTranslate = {
    to: string,
    from?: string,
    format?: keyof typeof TranslateFormat;
};

type OptionsTranslateMulti = Omit<OptionsTranslate, 'to'> & {to: string[]};

type OptionsGetLangs = {
    ui?: string;
};

type OptionsDetect = {
    hint?: string;
};

// -- responses
interface BaseResponse {
    readonly code: number;
}
interface ErrorResponse extends BaseResponse {
    message: string;
}
interface TranslateResponse extends BaseResponse {
    lang: string;
    text: string[];
}
interface DetectResponse extends BaseResponse {
    lang: string;
}
interface GetLangsResponse extends Partial<BaseResponse> {
    dirs: string[];
    langs?: {[key: string]: string};
}

// -- results
type MultiTranslationPart<T> = { text: T, lang: string };
type MultiTranslationPartError = { error: Error, lang: string };
type TranslationResult<T, U extends OptionsTranslate | OptionsTranslateMulti> = U extends OptionsTranslateMulti ? Array<MultiTranslationPart<T> | MultiTranslationPartError> : T;

type MultiDetectPart = { lang: string };
type MultiDetectPartError = { error: Error };
type DetectionResult<T> = T extends string[] ? Array<MultiDetectPart | MultiDetectPartError> : string;


export default class YandexTranslate {
    protected baseURL: string = 'https://translate.yandex.net/api/v1.5/tr.json/';
    protected timeout: number = 40 * 1000;
    protected _client!: AxiosInstance;
    protected _queue!: PQueue;

    constructor(
        protected apiKey: string,
        protected queue_options: false | PQueueOptions = {concurrency: 4}
    ) {}

    public async translate<T>(source: T, opts: OptionsTranslate): Promise<TranslationResult<T, OptionsTranslate>>;
    public async translate<T>(source: T, opts: OptionsTranslateMulti): Promise<TranslationResult<T, OptionsTranslateMulti>>;
    public async translate<T, U extends OptionsTranslate | OptionsTranslateMulti>(
        source: T,
        opts: U
    ): Promise<TranslationResult<T, U>> {
        if (opts && typeof opts.to === 'string') {
            return this._translate(source, opts as OptionsTranslate) as Promise<TranslationResult<T, U>>;
        }
        if (opts && YandexTranslate.isStringArray(opts.to)) {
            return Promise.all(opts.to.map((to) =>
                this._translate(source, { ...opts, to })
                    .then((translation) => ({ text: translation as T, lang: to } as MultiTranslationPart<T>))
                    .catch((error) => ({ error, lang: to } as MultiTranslationPartError))
            )) as Promise<TranslationResult<T, U>>;
        }

        throw new YandexTranslateError('INVALID_PARAM');
    }

    protected async _translate<T>(source: T, opts: OptionsTranslate): Promise<T> {
        const source_rows = json.serialize(source);
        const map = source_rows.reduce((acc, row, idx) => {
            const translatable = row[row.length - 1];
            if (typeof translatable === 'string' && !YandexTranslate.isEmpty(translatable)) {
                if (!acc.has(translatable)) {
                    acc.set(translatable, []);
                }
                acc.get(translatable)!.push(idx);
            }
            return acc;
        }, new Map<string, number[]>());

        const text = Array.from(map.keys());
        if (text.length > 0) {
            const translation = await this.translateStr(text, opts as OptionsTranslate);
            translation.forEach((tr, idx) => {
                map.get(text[idx])!.forEach((i) => {
                    const row = source_rows[i];
                    row[row.length - 1] = tr;
                });
            });
        }
        map.clear();

        const result = json.deserialize(source_rows);
        return result as T;
    }

    protected async translateStr<T extends string | string[]>(text: T, opts: OptionsTranslate): Promise<T> {
        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || TranslateFormat.plain;
        const { text: outputText }: { text: string[] } = await this.request<TranslateResponse>('translate', { lang, text, format });
        const result = YandexTranslate.isStringArray(text) ? outputText : outputText[0];
        return result as T;
    }

    public async detect(text: string[], opts?: OptionsDetect): Promise<DetectionResult<string[]>>;
    public async detect<T>(text: T, opts?: OptionsDetect): Promise<DetectionResult<T>>;
    public async detect<T, U extends DetectionResult<T>>(source: T, opts?: OptionsDetect): Promise<U | undefined> {
        if (YandexTranslate.isStringArray(source)) {
            return Promise.all(source.map((text) =>
                this._detect(text, opts)
                    .then((lang) => ({ lang } as MultiDetectPart))
                    .catch((error) => ({ error } as MultiDetectPartError))
            )) as Promise<U>;
        } else {
            const source_rows = json.serialize(source);
            const parts = source_rows.reduce((acc, row, idx) => {
                const translatable = row[row.length - 1];
                if (typeof translatable === 'string' && !YandexTranslate.isEmpty(translatable) && acc.indexOf(translatable) === -1) {
                    acc.push(translatable);
                }
                return acc;
            }, [] as string[]);
            if (parts.length > 0) {
                return this._detect(parts.join(' '), opts) as Promise<U>;
            }
        }
    }

    protected async _detect(text: string, opts?: OptionsDetect): Promise<string | undefined> {
        if (YandexTranslate.isEmpty(text)) {
            return;
        }
        const { lang } = await this.request<DetectResponse>('detect', { text, ...opts });
        return lang;
    }

    public async getLangs(opts?: OptionsGetLangs): Promise<GetLangsResponse> {
        return this.request<GetLangsResponse>('getLangs', opts);
    }

    protected get client(): AxiosInstance {
        if (!this._client) {
            this._client = createHttpAgent(this.baseURL, this.timeout);
        }
        return this._client;
    }

    protected get queue(): PQueue {
        if (!this._queue) {
            const queue_options: PQueueOptions = this.queue_options || { concurrency: Infinity };
            this._queue = new PQueue(queue_options);
        }
        return this._queue;
    }

    protected async request<T>(endpoint: string, params?: object): Promise<T> {
        return this.queue.add(async (): Promise<T> => {
            try {
                params = { key: this.apiKey, ...params };
                const { data }: { data?: T | ErrorResponse } = await this.client.post(endpoint, params);

                if (!data) {
                    throw new YandexTranslateError('EMPTY_DATA');
                }
                if ('code' in data && (data as ErrorResponse).code !== 200) {
                    throw new YandexTranslateError(data);
                }

                return data as T;
            } catch (err) {
                if (!(err instanceof YandexTranslateError)) {
                    const err_data = 'response' in err && err.response && 'data' in err.response && err.response.data;
                    if (err_data) {
                        err = new YandexTranslateError(err_data);
                    }
                    console.error('An error occured while translating:', err_data || err.message);
                }
                throw(err);
            }
        });
    }

    protected static isValid(x: any): boolean {
        if (typeof x === 'string' || x === null || x === undefined) {
            return true;
        }
        return YandexTranslate.isStringArray(x);
    }

    protected static isEmpty(x: string | string[]): boolean {
        if (Array.isArray(x)) {
            return !x.some((xx) => !YandexTranslate.isEmpty(xx));
        } else {
            return x === null || x === undefined || (typeof x === 'string' && !/\S/.test(x));
        }
    }

    protected static isStringArray(x: any): x is string[] {
        return Array.isArray(x) && !x.some((o) => !(typeof o === 'string' || o === null || o === undefined));
    }
}

export { YandexTranslate, OptionsTranslate, OptionsTranslateMulti, OptionsGetLangs, OptionsDetect };
