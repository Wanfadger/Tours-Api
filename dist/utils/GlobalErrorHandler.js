"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = void 0;
const GlobalErrorHandler = (error, req, res, next) => {
    console.log(error);
    if (error.code === 'P2002') {
        return res.status(400).json({
            status: 400,
            message: `Values for "${error.meta.target}" are creating duplicate values`
        });
    }
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message
    });
};
exports.GlobalErrorHandler = GlobalErrorHandler;
//# sourceMappingURL=GlobalErrorHandler.js.map