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
exports.signUp = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    try {
        const savedUser = yield prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                photo: user.photo,
                password: user.password
            }
        });
        res.status(201).json({
            data: savedUser
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.signUp = signUp;
//# sourceMappingURL=AuthController.js.map