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
declare class YandexTranslate {
    private apiKey;
    protected static baseURL: string;
    private client;
    constructor(apiKey: string);
    translate(text: string, opts: ITranslateOptions): Promise<string>;
    translate(text: string[], opts: ITranslateOptions): Promise<string[]>;
    detect(text: string, opts?: IDetectOptions): Promise<string>;
    getLangs(opts?: IGetLangsOptions): Promise<any>;
    private request;
    private static isEmpty;
}
export default YandexTranslate;
