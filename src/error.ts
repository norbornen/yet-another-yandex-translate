interface IYandexTranslateErrorReason {
    readonly code: number;
    message?: string;
}

export default class YandexTranslateError extends Error {
    public readonly code?: number;

    constructor(reason: IYandexTranslateErrorReason | string) {
        if (typeof reason === 'string') {
            super(reason);
        } else {
            super((reason && reason.message) || 'Something wrong');
            this.code = reason && reason.code;
        }
        this.code = this.code || 0;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export { YandexTranslateError };
