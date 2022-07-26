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
exports.deleteMe = exports.updateMe = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.RoleRestriction = exports.AuthGuard = exports.signUp = exports.login = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Jwt = __importStar(require("jsonwebtoken"));
const ApiError_1 = require("./../utils/ApiError");
const emailer_1 = require("../utils/emailer");
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
                password: yield bcryptjs_1.default.hash(user.password, bcryptjs_1.default.genSaltSync(Number(process.env.BCRYPT_SALT)))
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
const AuthGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.AuthGuard = AuthGuard;
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
        const reqUrl = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${token}`;
        // TODO: Send email notification
        const message = `Forgot your password? \n Submit a PUT request with your new password to ${reqUrl} \n If you didn't forgot your password, please ignore this email!`;
        try {
            yield (0, emailer_1.sendEmail)({ to: updated.email, from: process.env.EMAIL_FROM, subject: "RESET_PASSWORD_TOKEN_EXPIRES_IN 10 minutes", message: message });
        }
        catch (error) {
            yield prisma.user.update({
                where: { id: user.id },
                data: Object.assign(Object.assign({}, user), { passwordResetToken: undefined, passwordResetExpires: undefined })
            });
            next(new ApiError_1.ApiError("There was an error sending email, please try again later", 500));
        }
        res.status(200).json({
            mesage: "Rest link sent on your email address, expires in 10 minutes.",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rPassword = req.body;
        const token = req.params.token;
        // TODO: if toke exists
        if (!token) {
            return next(new ApiError_1.ApiError("Token is missiong", 400));
        }
        // TODO: GET User based on the reset password token 
        const rToken = crypto_1.default.createHash(process.env.RESET_PASSWORD_TOKEN_EXPIRES_ALOG).update(token).digest("hex");
        const user = yield prisma.user.findFirst({
            where: { passwordResetToken: rToken, passwordResetExpires: { gt: new Date(Date.now()) } }
        });
        if (!user) {
            return next(new ApiError_1.ApiError("Token is invalid or has expired", 400));
        }
        yield prisma.user.update({
            where: { id: user.id },
            data: Object.assign(Object.assign({}, user), { password: yield bcryptjs_1.default.hash(rPassword.password, bcryptjs_1.default.genSaltSync(Number(process.env.BCRYPT_SALT))), passwordResetToken: null, passwordResetExpires: null })
        });
        // TODO: Log user in , send jwt token
        res.status(200).json({
            token: genToken(user.id)
        });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: GET User
        const user = req.body.user;
        const dto = req.body;
        if (!dto.newPassword && !dto.password) {
            return next(new ApiError_1.ApiError("Missing update passwords", 400));
        }
        // TODO: CHECK Password Correct
        const updateUser = yield prisma.user.findUnique({
            where: { id: user.id },
        });
        if (updateUser && !(yield bcryptjs_1.default.compare(dto.password, updateUser === null || updateUser === void 0 ? void 0 : updateUser.password))) {
            return next(new ApiError_1.ApiError("Invalid password", 403));
        }
        // TODO: UPDATE PASSWORD
        yield prisma.user.update({
            where: { id: user.id },
            data: Object.assign(Object.assign({}, updateUser), { password: yield bcryptjs_1.default.hash(dto.newPassword, bcryptjs_1.default.genSaltSync(Number(process.env.BCRYPT_SALT))) })
        });
        res.status(200).json({
            token: genToken(user.id)
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePassword = updatePassword;
const updateMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: GET User
        const user = req.body.user;
        const dto = req.body;
        let updateUser = yield prisma.user.findUnique({
            where: { id: user.id },
        });
        if (dto.name) {
            updateUser = Object.assign(Object.assign({}, updateUser), { name: dto.name });
        }
        if (dto.photo) {
            updateUser = Object.assign(Object.assign({}, updateUser), { photo: dto.photo });
        }
        // TODO: UPDATE PASSWORD
        yield prisma.user.update({
            where: { id: user.id },
            data: Object.assign({}, updateUser)
        });
        res.status(200).json({
            message: 'User updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMe = updateMe;
const deleteMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: GET User
        const user = req.body.user;
        // TODO: UPDATE PASSWORD
        yield prisma.user.delete({
            where: { id: user.id },
        });
        res.status(204).json({
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMe = deleteMe;
//# sourceMappingURL=AuthController.js.map