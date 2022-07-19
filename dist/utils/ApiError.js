"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = false;
        this.statusCode = this.statusCode || 500;
        this.isOperational = true;
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map