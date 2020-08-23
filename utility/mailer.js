const nodemailer = require("nodemailer");
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

const emailConfig = require("../config/email");

//@ Open template file
var source = fs.readFileSync(path.join(__dirname, '../views/mailTemplate.hbs'), 'utf8');
var sourceSchedule = fs.readFileSync(path.join(__dirname,'../views/schedueTemplate.hbs'),'utf-8');

//@ compile template file
var template = Handlebars.compile(source);
var templateSchedule = Handlebars.compile(sourceSchedule);

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

//for schedule mail
exports.scheduleMail = (mailList,details,subject) => {
 let replacements = {
    receiverName:details.receiverName,
    scheduleSubject:details.scheduleSubject,
    teacherName:details.teacherName,
    scheduleDate:details.scheduleDate,
    scheduleTime:details.scheduleTime,
    orgName:details.orgName,
    purpose: details.purpose,
};
console.log("mailer running");
  transporter.sendMail({
      from: emailConfig.email,
      to: mailList,
      subject:subject,
      html: templateSchedule(replacements)
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


// otp mail
exports.otpMail = (user, subject,purpose) => {
  let replacements = {
    purpose: purpose,
    otp: user.otp
};
  transporter.sendMail({
      from: emailConfig.email,
      to: user.email,
      subject,
      html: template(replacements)
    },
    (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent success.");
      }
    }
  );
};