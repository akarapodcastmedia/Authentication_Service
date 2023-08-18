require("dotenv").config();
const nodemailer = require("nodemailer");
// defined mail configuration
const Mainserver = async (email,html)=>{
    const transporter_gmail = nodemailer.createTransport({
        host : "gmail.smtp.com",
        port : 465,
        service : "gmail",
        secure : true,
        auth : {
            user : process.env.Email,
            pass : process.env.Email_Secret
        }
    });
   
    // send mail 
    const info = await transporter_gmail.sendMail({
            from : `Akara <${process.env.Email}>`,
            to : email,
            subject : "Welcome to our Akara podcast app.",
            html : html
    })
    console.log("Mail sent",info.messageId);  
}
module.exports = {
    Mainserver
}