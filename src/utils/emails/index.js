import nodemailer from "nodemailer";
import { EventEmitter } from "events";
export const sendEmail = async ({to,subject,html}) => {
  //generate transporter (like human to send mail)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // service like gmail , yahoo smtp gmail gives us 500 mails free mounthly
    port: 587,
    secure: false, //if true will make encryption
    auth: {
      //send from gamil to any other service sont have to be gmail
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    tls: {
        rejectUnauthorized: false, // Bypass SSL certificate validation
      },
  });
  
  const info = await transporter.sendMail({
    from: `Job Search App <${process.env.EMAIL}>`,
    to, //can take multtiple emails in a string separated by ,
    subject,
    html,
  });
  if(info.rejected.length>0) return false //if one if the sent emails in to is rejected return false
  return true; //else return true
};
export const sendEmailEvent = new EventEmitter()

sendEmailEvent.on("sendEmail",async(email,otp)=>{
  await sendEmail({
    to:email,
    subject:"Verify account",
    html:`<p>You OTP (one time password) ${otp}</p>`
  })
})
