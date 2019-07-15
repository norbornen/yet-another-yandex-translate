interface YandexTranslateErrorReason {
    code: number;
    message?: string;
}
declare class YandexTranslateError extends Error {
    code?: number;
    constructor(reason: YandexTranslateErrorReason | string);
}
export default YandexTranslateError;
