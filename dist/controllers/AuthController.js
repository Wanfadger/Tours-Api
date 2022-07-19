"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.RoleRestriction = exports.ValidateToken = exports.signUp = exports.login = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Jwt = __importStar(require("jsonwebtoken"));
const ApiError_1 = require("./../utils/ApiError");
const prisma = new client_1.PrismaClient();
const genToken = (id) => {
    return Jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
};
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login = req.body;
        if (!login.email && !login.password) {
            return next(new ApiError_1.ApiError(`Please enter email and password`, 400));
        }
        const user = yield prisma.user.findUnique({
            where: { email: login.email }
        });
        if (user && (yield bcryptjs_1.default.compare(login.password, user.password))) {
            res.status(200).json({ token: genToken(user.id) });
        }
        else {
            return next(new ApiError_1.ApiError(`Invalid email or password provided`, 400));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    try {
        const savedUser = yield prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                photo: user.photo,
                password: yield bcryptjs_1.default.hash(user.password, bcryptjs_1.default.genSaltSync(12))
            }
        });
        res.status(201).json({
            data: savedUser,
            token: genToken(savedUser.id)
        });
    }
    catch (error) {
        next(error);
    }
});
exports.signUp = signUp;
const ValidateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ///1) Check if the token is there
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new ApiError_1.ApiError(`You are not authorized to access, please login`, 401));
        }
        ///2) Check if the token is valid
        const verify = new Promise((resolve, reject) => {
            Jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
                if (error) {
                    return reject(error);
                }
                return resolve(decoded);
            });
        });
        const payLoad = yield verify;
        ///3) Check if user still exists
        const user = yield prisma.user.findUnique({ where: { id: payLoad.id }, select: { id: true, email: true, role: true } });
        if (!user) {
            return new ApiError_1.ApiError(`User nolonger exits`, 401);
        }
        ///5) GRANT ACCESS to user
        req.body.user = user;
        console.log(req.body);
        next();
    }
    catch (error) {
        return next(error);
    }
});
exports.ValidateToken = ValidateToken;
const RoleRestriction = (...roles) => {
    return (req, res, next) => {
        const user = req.body.user;
        if (!roles.includes(user.role)) {
            return next(new ApiError_1.ApiError("Your not allowed to perform this action", 403));
        }
        next();
    };
};
exports.RoleRestriction = RoleRestriction;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Get user based on posted email address
        const fPassword = req.body;
        const user = yield prisma.user.findUnique({ where: { email: fPassword.email } });
        if (!user) {
            return next(new ApiError_1.ApiError("User not found", 403));
        }
        // TODO: Generate random reset token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const rToken = crypto_1.default.createHash(process.env.RESET_PASSWORD_TOKEN_EXPIRES_ALOG).update(token).digest("hex");
        const expires = new Date(Date.now() + 1000 * 60 * Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN)); // 10 minutes
        const updated = yield prisma.user.update({
            where: { id: user.id },
            data: Object.assign(Object.assign({}, user), { passwordResetToken: rToken, passwordResetExpires: expires })
        });
        if (!updated) {
            return next(new ApiError_1.ApiError("Reset password token failed", 403));
        }
        // TODO: Send email notification
        res.status(200).json({
            "mesage": "link sent on your email address"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => {
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=AuthController.js.map