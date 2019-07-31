import PQueue, { Queue, Options, QueueAddOptions } from 'p-queue';
import { AxiosInstance } from 'axios';
import YandexTranslateError from './error';
import createHttpAgent from './tools/agent';

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
type MultiTranslationPart<T extends string | string[]> = { text: T, lang?: string };
type MultiTranslationPartError = { error: Error };
type TranslationResult<U extends OptionsTranslate | OptionsTranslateMulti, T extends string | string[]> = U extends OptionsTranslateMulti ? Array<MultiTranslationPart<T> | MultiTranslationPartError> : T;

type MultiDetectPart = { lang: string };
type MultiDetectPartError = { error: Error };
type DetectionResult<T> = T extends string[] ? Array<MultiDetectPart | MultiDetectPartError> : string;


export default class YandexTranslate {
    protected baseURL: string = 'https://translate.yandex.net/api/v1.5/tr.json/';
    protected timeout: number = 40 * 1000;
    protected _client: AxiosInstance;
    protected _queue: PQueue;

    constructor(
        protected apiKey: string,
        protected queue_options: false | PQueueOptions = {concurrency: 4}
    ) {}

    public async translate(text: string, opts: OptionsTranslate): Promise<TranslationResult<OptionsTranslate, string>>;
    public async translate(text: string[], opts: OptionsTranslate): Promise<TranslationResult<OptionsTranslate, string[]>>;
    public async translate(text: string, opts: OptionsTranslateMulti): Promise<TranslationResult<OptionsTranslateMulti, string>>;
    public async translate(text: string[], opts: OptionsTranslateMulti): Promise<TranslationResult<OptionsTranslateMulti, string[]>>;
    public async translate<T extends string | string[], U extends OptionsTranslate | OptionsTranslateMulti, O extends TranslationResult<U, T>>(
        text: T,
        opts: U
    ): Promise<O> {
        if (!YandexTranslate.isValid(text) || !opts || !opts.to || (Array.isArray(opts.to) && !YandexTranslate.isStringArray(opts.to))) {
            throw new YandexTranslateError('INVALID_PARAM');
        }
        if (YandexTranslate.isEmpty(text)) {
            return;
        }

        if (YandexTranslate.isStringArray(opts.to)) {
            return await Promise.all(opts.to.map((to) => {
                return this._translate(text, Object.assign(opts, { to }))
                    .then((outputText) => ({ text: outputText, lang: to } as MultiTranslationPart<T>))
                    .catch((error) => ({ error } as MultiTranslationPartError));
            })) as O;
        } else {
            return await this._translate(text, opts as OptionsTranslate) as O;
        }
    }

    protected async _translate<T extends string | string[]>(text: T, opts: OptionsTranslate): Promise<T> {
        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || TranslateFormat.plain;
        const { text: outputText } = await this.request<TranslateResponse>('translate', { lang, text, format });
        return (YandexTranslate.isStringArray(text) ? outputText : outputText[0]) as T;
    }

    public async detect(text: string, opts?: OptionsDetect): Promise<string>;
    public async detect(text: string[], opts?: OptionsDetect): Promise<DetectionResult<string[]>>;
    public async detect<T extends string | string[], U extends DetectionResult<T>>(text: T, opts?: OptionsDetect): Promise<U> {
        if (!YandexTranslate.isValid(text)) {
            throw new YandexTranslateError('INVALID_PARAM');
        }

        if (YandexTranslate.isStringArray(text)) {
            return await Promise.all(text.map((x) => {
                return this._detect(x, opts)
                    .then((lang) => ({ lang } as MultiDetectPart))
                    .catch((error) => ({ error } as MultiDetectPartError));
            })) as U;
        } else {
            return await this._detect(text as string, opts) as U;
        }
    }

    protected async _detect(text: string, opts?: OptionsDetect): Promise<string> {
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
                    console.error('An error occured while ytranslating:', err_data || err.message);
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
