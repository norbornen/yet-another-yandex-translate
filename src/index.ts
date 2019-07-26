import PQueue, { Queue, Options, QueueAddOptions } from 'p-queue';
import { AxiosInstance } from 'axios';
import YandexTranslateError from './error';
import createHttpAgent from './tools/agent';

interface IYandexTranslateQueueOptions extends Options<Queue<QueueAddOptions>, QueueAddOptions> {
}

interface IResponseRejected {
    code: number;
    message: string;
}

// -
enum ETranslateFormat {
    html = 'html',
    plain = 'plain'
}

type TranslateFormat = keyof typeof ETranslateFormat;

interface ITranslateOptions {
    from?: string;
    format?: TranslateFormat;
}

interface ITranslateOneDirectionOptions extends ITranslateOptions {
    to: string;
}

interface ITranslateMultiDirectionOptions extends ITranslateOptions {
    to: string[];
}

interface ITranslateResponse {
    code: number;
    lang: string;
    text: string[];
}

interface IMultipleTranslateResult<T extends string | string[]> {
    text: T;
    error?: Error;
}

type TranslationResult<U extends ITranslateOneDirectionOptions | ITranslateMultiDirectionOptions, T extends string | string[]> = U extends ITranslateMultiDirectionOptions ? Array<IMultipleTranslateResult<T>> : T;

// -
interface IGetLangsOptions {
    ui?: string;
}

interface IGetLangsResponse {
    dirs: string[];
    langs?: {[key: string]: string};
}

// -
interface IDetectOptions {
    hint?: string;
}

interface IDetectResponse {
    code: number;
    lang: string;
}

interface IMultipleDetectResult {
    lang: string;
    error?: Error;
}

type DetectionResult<T> = T extends string[] ? IMultipleDetectResult[] : string;


class YandexTranslate {
    protected static baseURL: string = 'https://translate.yandex.net/api/v1.5/tr.json/';
    protected static timeout: number = 40 * 1000;
    protected _client: AxiosInstance;
    protected _queue: PQueue;

    constructor(
        protected apiKey: string,
        protected queue_options: false | IYandexTranslateQueueOptions = {concurrency: 4}
    ) {}

    public async translate(text: string, opts: ITranslateOneDirectionOptions): Promise<string>;
    public async translate(text: string[], opts: ITranslateOneDirectionOptions): Promise<string[]>;
    public async translate(text: string, opts: ITranslateMultiDirectionOptions): Promise<IMultipleTranslateResult<string>>;
    public async translate(text: string[], opts: ITranslateMultiDirectionOptions): Promise<IMultipleTranslateResult<string[]>>;
    public async translate<T extends string | string[], U extends ITranslateOneDirectionOptions | ITranslateMultiDirectionOptions, O extends TranslationResult<U, T>>(
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
                    .then((outputText) => ({ text: outputText, lang: to } as IMultipleTranslateResult<T>))
                    .catch((error) => ({ error } as IMultipleTranslateResult<T>));
            })) as O;
        } else {
            return await this._translate(text, opts as ITranslateOneDirectionOptions) as O;
        }
    }

    protected async _translate<T extends string | string[]>(text: T, opts: ITranslateOneDirectionOptions): Promise<T> {
        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || ETranslateFormat.plain;

        const data = await this.request<ITranslateResponse | IResponseRejected>('translate', { lang, text, format });
        if (!data || ('code' in data && data.code !== 200) || !('text' in data)) {
            throw new YandexTranslateError(data);
        }

        const outputText = data.text;
        return (YandexTranslate.isStringArray(text) ? outputText : outputText[0]) as T;
    }

    public async detect(text: string, opts?: IDetectOptions): Promise<string>;
    public async detect(text: string[], opts?: IDetectOptions): Promise<IMultipleDetectResult[]>;
    public async detect<T extends string | string[], U extends DetectionResult<T>>(text: T, opts?: IDetectOptions): Promise<U> {
        if (!YandexTranslate.isValid(text)) {
            throw new YandexTranslateError('INVALID_PARAM');
        }

        if (YandexTranslate.isStringArray(text)) {
            return await Promise.all(text.map((x) => {
                return this._detect(x, opts)
                    .then((lang) => ({ lang } as IMultipleDetectResult))
                    .catch((error) => ({ error } as IMultipleDetectResult));
            })) as U;
        } else {
            return await this._detect(text as string, opts) as U;
        }
    }

    protected async _detect(text: string, opts?: IDetectOptions): Promise<string> {
        if (YandexTranslate.isEmpty(text)) {
            return;
        }

        const data = await this.request<IDetectResponse | IResponseRejected>('detect', { text, ...opts });
        if (!data || ('code' in data && data.code !== 200) || !('lang' in data)) {
            throw new YandexTranslateError(data);
        }

        return data.lang;
    }

    public async getLangs(opts?: IGetLangsOptions): Promise<IGetLangsResponse> {
        const data = await this.request<IGetLangsResponse | IResponseRejected>('getLangs', opts);
        if (!data || ('code' in data && data.code !== 200)) {
            throw new YandexTranslateError(data as IResponseRejected);
        }

        return data as IGetLangsResponse;
    }

    protected get client(): AxiosInstance {
        if (!this._client) {
            this._client = createHttpAgent(YandexTranslate.baseURL, YandexTranslate.timeout);
        }
        return this._client;
    }

    protected get queue(): PQueue {
        if (!this._queue) {
            const queue_options: IYandexTranslateQueueOptions = this.queue_options || { concurrency: Infinity };
            this._queue = new PQueue(queue_options);
        }
        return this._queue;
    }

    protected async request<T>(endpoint: string, params?: object): Promise<T> {
        return this.queue.add(async (): Promise<T> => {
            const { data }: { data: T } = await this.client.post(endpoint, { key: this.apiKey, ...params });
            return data;
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

export default YandexTranslate;
