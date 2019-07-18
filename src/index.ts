import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import qs from 'qs';
import YandexTranslateError from './error';

enum ETranslateFormat {
    html = 'html',
    plain = 'plain'
}

type TranslateFormat = keyof typeof ETranslateFormat;

interface ITranslateOptions {
    from?: string;
    to: string;
    format?: TranslateFormat;
}

interface IMultTranslateOptions {
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

interface ITranslateResponseFilled {
    code: number;
    lang: string;
    text: string[];
}

interface IDetectResponseFilled {
    code: number;
    lang: string;
}

interface IGetLangsResponseFilled {
    dirs: string[];
    langs?: {[key: string]: string};
}

class YandexTranslate {
    protected static baseURL: string = 'https://translate.yandex.net/api/v1.5/tr.json/';
    private client: AxiosInstance;

    constructor(private apiKey: string) {
        this.client = axios.create({
            baseURL: YandexTranslate.baseURL,
            timeout: 30 * 1000,
            headers: {
                'User-Agent': 'YetAnotherYandexTranslateClient',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        } as AxiosRequestConfig);
        this.client.interceptors.request.use((request: AxiosRequestConfig) => {
            if (request.data && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                if ('text' in request.data && Array.isArray(request.data.text)) {
                    // tslint:disable-next-line:no-null-keyword
                    request.data.text = request.data.text.map((x: string) => x === undefined ? null : x);
                }
                request.data = qs.stringify(request.data, {arrayFormat: 'repeat'});
            }
            return request;
        });
        this.client.interceptors.response.use(
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
    }

    public async translate<T extends string | string[]>(text: T, opts: ITranslateOptions): Promise<T> {
        if (YandexTranslate.isEmpty(text)) {
            return text;
        }

        const lang = opts.to && opts.from ? `${opts.from}-${opts.to}` : opts.to;
        const format = opts.format || ETranslateFormat.plain;

        const data = await this.request<ITranslateResponseFilled | IResponseRejected>('translate', { lang, text, format });
        if (!data || ('code' in data && data.code !== 200) || !('text' in data)) {
            throw new YandexTranslateError(data);
        }

        const outputText = data.text;
        return (Array.isArray(text) ? outputText : outputText[0]) as T;
    }

    public async detect(text: string, opts?: IDetectOptions): Promise<string> {
        if (YandexTranslate.isEmpty(text)) {
            return;
        }

        const data = await this.request<IDetectResponseFilled | IResponseRejected>('detect', { text, ...opts });
        if (!data || ('code' in data && data.code !== 200) || !('lang' in data)) {
            throw new YandexTranslateError(data);
        }

        return data.lang;
    }

    public async getLangs(opts?: IGetLangsOptions): Promise<IGetLangsResponseFilled> {
        const data = await this.request<IGetLangsResponseFilled | IResponseRejected>('getLangs', opts);
        if (!data || ('code' in data && (data as IResponseRejected).code !== 200)) {
            throw new YandexTranslateError(data as IResponseRejected);
        }

        return data as IGetLangsResponseFilled;
    }

    private async request<T>(endpoint: string, params?: object): Promise<T> {
        const { data }: { data: T } = await this.client.post(endpoint, { key: this.apiKey, ...params });
        return data;
    }

    private static isEmpty(x: string | string[]): boolean {
        if (Array.isArray(x)) {
            return !x.some((xx) => !YandexTranslate.isEmpty(xx));
        } else {
            return x === null || x === undefined || !/\S/.test(x);
        }
    }
}

export default YandexTranslate;
