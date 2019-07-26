interface IYandexTranslateErrorReason {
    code: number;
    message?: string;
}

class YandexTranslateError extends Error {
    public code?: number;

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

export default YandexTranslateError;
