import  nodemailer from "nodemailer"
import { Email } from "./../dtos/auth.dtos";


export const sendEmail = async (email:Email) => {
      // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME, //  user
          pass: process.env.EMAIL_PASSWORD, // password
        },
      });



       // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `Tours 👻 <${email.from}>`, // sender address
    to: email.to, // list of receivers
    subject: email.subject, // Subject line
    text: email.message, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

}