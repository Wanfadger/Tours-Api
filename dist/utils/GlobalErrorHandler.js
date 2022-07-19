"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = void 0;
const ApiError_1 = require("./ApiError");
const handleJsonWebTokenError = (error) => new ApiError_1.ApiError(error.message, 400);
const handleTokenExpiredError = (error) => new ApiError_1.ApiError("Your authorization token has expired, please login again", 400);
const handleDbUniqueViaoletionError = (error) => new ApiError_1.ApiError(`Values for "${error.meta.target}" are creating duplicate values`, 400);
const GlobalErrorHandler = (error, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(error);
    }
    if (error.code === 'P2002')
        error = handleDbUniqueViaoletionError(error);
    if (error.name === 'JsonWebTokenError')
        error = handleJsonWebTokenError(error);
    if (error.name === 'TokenExpiredError')
        error = handleTokenExpiredError(error);
    error.statusCode = error.statusCode || 500;
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }
    else {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }
};
exports.GlobalErrorHandler = GlobalErrorHandler;
//# sourceMappingURL=GlobalErrorHandler.js.map