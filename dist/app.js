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
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use((0, express_query_parser_1.queryParser)({
    parseBoolean: true,
    parseNull: true,
    parseNumber: true,
    parseUndefined: true,
}));
exports.app.use('/api/tours', TourRouter_1.TourRouter);
//# sourceMappingURL=app.js.map