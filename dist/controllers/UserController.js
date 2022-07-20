"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.allUsers = void 0;
const ApiError_1 = require("./../utils/ApiError");
const client_1 = require("@prisma/client");
const util_1 = require("./../utils/util");
const prisma = new client_1.PrismaClient();
const allUsers = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            where: { active: true },
            select: Object.assign({}, (0, util_1.selectPrismaFields)('name', 'id', 'email', 'photo', 'role'))
        });
        res.status(200).json({
            count: users.length,
            data: users
        });
    }
    catch (error) {
        next(error);
    }
});
exports.allUsers = allUsers;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield prisma.user.findUnique({
            where: { id },
            select: Object.assign({}, (0, util_1.selectPrismaFields)('name', 'id', 'email', 'photo', 'role'))
        });
        if (!user) {
            return next(new ApiError_1.ApiError(`User not found`, 404));
        }
        res.status(200).json({
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
//# sourceMappingURL=UserController.js.map