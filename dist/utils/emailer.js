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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = yield nodemailer_1.default.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD, // password
        },
    });
    // send mail with defined transport object
    let info = yield transporter.sendMail({
        from: `Tours 👻 <${email.from}>`,
        to: email.to,
        subject: email.subject,
        text: email.message, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailer.js.map