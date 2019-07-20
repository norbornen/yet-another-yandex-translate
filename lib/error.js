"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class YandexTranslateError extends Error {
    constructor(reason) {
        if (typeof reason === 'string') {
            super(reason);
        }
        else {
            super((reason && reason.message) || 'Something wrong');
            this.code = reason && reason.code;
        }
        this.code = this.code || 0;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.default = YandexTranslateError;
//# sourceMappingURL=error.js.map