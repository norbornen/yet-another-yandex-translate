import { AxiosInstance } from 'axios';
declare enum ETranslateFormat {
    html = "html",
    plain = "plain"
}
declare type TranslateFormat = keyof typeof ETranslateFormat;
interface ITranslateOptions {
    from?: string;
    to: string;
    format?: TranslateFormat;
}
interface IDetectOptions {
    hint?: string;
}
interface IGetLangsOptions {
    ui?: string;
}
interface IGetLangsResponse {
    dirs: string[];
    langs?: {
        [key: string]: string;
    };
}
declare class YandexTranslate {
    protected apiKey: string;
    protected static baseURL: string;
    protected client: AxiosInstance;
    constructor(apiKey: string);
    translate<T extends string | string[]>(text: T, opts: ITranslateOptions): Promise<T>;
    detect(text: string, opts?: IDetectOptions): Promise<string>;
    getLangs(opts?: IGetLangsOptions): Promise<IGetLangsResponse>;
    protected request<T>(endpoint: string, params?: object): Promise<T>;
    protected static initClient(): AxiosInstance;
    protected static isValid(x: any): boolean;
    protected static isEmpty(x: string | string[]): boolean;
}
export default YandexTranslate;
