import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import YandexTranslateError from './error';
import stringify from './tools/stringify';

enum ETranslateFormat {
    html = 'html',
    plain = 'plain'
}

type TranslateFormat = keyof typeof ETranslateFormat;

interface ITranslateOneDirectionOptions {
    from?: string;
    to: string;
    format?: TranslateFormat;
}

interface ITranslateMultyDirectionOptions {
    from?: string;
    to: string[];
    format?: TranslateFormat;
}

interface IDetectOptions {
    hint?: string;
}

interface IGetLangsOptions {
    ui?: string;
}

interface IResponseRejected {
    code: number;
    message: string;
}

interface ITranslateResponse {
    code: number;
    lang: string;
    text: string[];
}

interface IDetectResponse {
    code: number;
    lang: string;
}

interface IGetLangsResponse {
    dirs: string[];
    langs?: {[key: string]: string};
}

class YandexTranslate {
    protected static baseURL: string = 'https://translate.yandex.net/api/v1.5/tr.json/';
    protected client: AxiosInstance;

    constructor(protected apiKey: string) {
        this.client = YandexTranslate.initClient();
    }

    public async translate(text: string, opts: ITranslateOneDirectionOptions): Promise<string>;
    public async translate(text: string[], opts: ITranslateOneDirectionOptions): Promise<string[]>;
    public async translate<T extends string | string[]>(text: T, opts: ITranslateOneDirectionOptions): Promise<T> {
        if (!YandexTranslate.isValid(text) || !opts) {
            throw new YandexTranslateError('INVALID_PARAM');
        }
        if (YandexTranslate.isEmpty(text) || !opts.to) {
            return text; // empty string -> empty string; empty array -> empty array, null -> null
        }

        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || ETranslateFormat.plain;

        const data = await this.request<ITranslateResponse | IResponseRejected>('translate', { lang, text, format });
        if (!data || ('code' in data && data.code !== 200) || !('text' in data)) {
            throw new YandexTranslateError(data);
        }

        const outputText = data.text;
        return (Array.isArray(text) ? outputText : outputText[0]) as T;
    }

    public async detect(text: string, opts?: IDetectOptions): Promise<string>;
    public async detect(text: string[], opts?: IDetectOptions): Promise<string[]>;
    public async detect<T extends string | string[]>(text: T, opts?: IDetectOptions): Promise<string | string[]> {
        if (!YandexTranslate.isValid(text)) {
            throw new YandexTranslateError('INVALID_PARAM');
        }

        if (YandexTranslate.isStringArray(text)) { // <- плохо
            return Promise.all(text.map((x) => this._detect(x, opts)));
        } else {
            return this._detect(text as string, opts);
        }
    }

    public async getLangs(opts?: IGetLangsOptions): Promise<IGetLangsResponse> {
        const data = await this.request<IGetLangsResponse | IResponseRejected>('getLangs', opts);
        if (!data || ('code' in data && (data as IResponseRejected).code !== 200)) {
            throw new YandexTranslateError(data as IResponseRejected);
        }

        return data as IGetLangsResponse;
    }

    protected async _detect(text: string, opts?: IDetectOptions): Promise<string> {
        if (YandexTranslate.isEmpty(text)) {
            return;
        }

        const data = await this.request<IDetectResponse | IResponseRejected>('detect', { text, ...opts });
        if (!data || ('code' in data && data.code !== 200) || !('lang' in data)) {
            throw new YandexTranslateError(data);
        }

        return data.lang as string;
    }

    protected async request<T>(endpoint: string, params?: object): Promise<T> {
        const { data }: { data: T } = await this.client.post(endpoint, { key: this.apiKey, ...params });
        return data;
    }

    protected static initClient(): AxiosInstance {
        const client = axios.create({
            baseURL: YandexTranslate.baseURL,
            timeout: 30 * 1000,
            headers: {
                'User-Agent': 'YetAnotherYandexTranslateClient',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        } as AxiosRequestConfig);

        client.interceptors.request.use((request: AxiosRequestConfig) => {
            if (request.headers['Content-Type'] === 'application/x-www-form-urlencoded' && request.data) {
                request.data = stringify(request.data);
            }
            return request;
        });

        client.interceptors.response.use(
            undefined,
            (err) => {
                if ('response' in err && err.response && 'data' in err.response) {
                    console.error('An error occured while translating: ', err.response.data);
                    throw new YandexTranslateError(err.response.data);
                }
                console.error('An error occured while translating: ', err);
                throw err;
            }
        );
        return client;
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
            return x === null || x === undefined || !/\S/.test(x);
        }
    }

    protected static isStringArray(x: any): x is string[] {
        return Array.isArray(x) && !x.some((o) => !(typeof o === 'string' || o === null || o === undefined));
    }
}

export default YandexTranslate;
