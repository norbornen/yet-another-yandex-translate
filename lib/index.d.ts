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
    private apiKey;
    protected static baseURL: string;
    private client;
    constructor(apiKey: string);
    translate<T extends string | string[]>(text: T, opts: ITranslateOptions): Promise<T>;
    detect(text: string, opts?: IDetectOptions): Promise<string>;
    getLangs(opts?: IGetLangsOptions): Promise<IGetLangsResponse>;
    private request;
    private static isEmpty;
}
export default YandexTranslate;
