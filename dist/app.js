"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_query_parser_1 = require("express-query-parser");
const TourRouter_1 = require("./routes/TourRouter");
const AuthRouter_1 = require("./routes/AuthRouter");
const ApiError_1 = require("./utils/ApiError");
const GlobalErrorHandler_1 = require("./utils/GlobalErrorHandler");
const AuthController_1 = require("./controllers/AuthController");
const client_1 = require("@prisma/client");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use((0, express_query_parser_1.queryParser)({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true,
}));
exports.app.use("/api/auth", AuthRouter_1.AuthRouter);
exports.app.use('/api/tours', AuthController_1.AuthGuard, (0, AuthController_1.RoleRestriction)(client_1.Role.ADMIN, client_1.Role.LEAD_GUIDE), TourRouter_1.TourRouter);
exports.app.all("*", (req, res, next) => next(new ApiError_1.ApiError(`Can't find ${req.originalUrl} on the server`, 404)));
/// global error handler
exports.app.use(GlobalErrorHandler_1.GlobalErrorHandler);
//# sourceMappingURL=app.js.map