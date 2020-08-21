const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const otp = require("../models/otp");
const random = require("../utility/random");
const _ = require("lodash");
const mailer = require("../utility/mailer");

router.post("/user/sendOtp",(req,res,next)=>{
var {email} = req.body;

userData.findOne({
    user:{$elemMatch:{email:email}}
}).then(userExists=>{
if(userExists){
    console.log("user_Exsits");
  var otpToSend = random.randomOtp();
   var time = new Date();

 otp.findOneAndUpdate({
          email
        }, {
          otp:otpToSend,
          createdAt:time
        }, {
          upsert: true,
          new: true
        }).then(otpSent => {
          console.log(otpSent);
          console.log("before sending mail");
otpSent.otpToSend
          mailer.otpMail(otpSent, "OTP FOR PASSWORD CHANGE", "change your password"); //send otp on mail
          console.log("after sending mail");
          res.send({
            message: "otp_sent"
          });
        }).catch(e => console.log(e)); 
}
else{
    console.log("user not found");
    res.send({
        message:"user_not_found"
    });
}
}).catch(err=>console.log(err.message));

});




router.post("/user/verifyOtp",(req,res,next)=>{
var {
    email,
    otpReceived
  } = req.body;

  console.log("entered " + otpReceived);
  console.log(email);
  otp
    .findOne({
      email
    })
    .then(changeUser => {
      if (changeUser) {
        console.log("existing " + changeUser.otp);
        if (changeUser.otp === otpReceived) {
          res.send({
            message: "matched"
          });
        } else {
          res.send({
            message: "not_matched"
          });
        }
      } else {
        res.send({
          message: "otp_expired"
        });
      }
    })
    .catch(err => {
      console.log(err);

    });



});

router.post("/user/changePassword",(req,res,next)=>{
    
});


module.exports = router;
