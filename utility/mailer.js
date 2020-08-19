//@ npm modules
const nodemailer = require("nodemailer");
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

//@ self made modules to be used
const emailConfig = require("../config/email"); //email configurations

//@ Open template file
var source = fs.readFileSync(path.join(__dirname, '../views/mailTemplate.hbs'), 'utf8');
//@ compile template file
var template = Handlebars.compile(source);

//@ create the mail transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.email,
    pass: emailConfig.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.mail = (mailList) => {
  var replacements = {
    purpose: "hii",
    otp: "class"
};
console.log("mailer running");
  transporter.sendMail({
      from: emailConfig.email,
      to: mailList,
      subject:"add",
      html: template(replacements)
    },
    (error, info) => {
      //(to,subject,text,html,callback)
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent success.");
      }
    }
  );
};