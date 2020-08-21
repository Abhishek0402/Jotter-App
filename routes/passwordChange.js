const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const otp = require("../models/otp");
const random = require("../utility/random");
const _ = require("lodash");

router.post("/user/sendOtp",(req,res,next)=>{
var {mobile,email} = req.body;

userData.findOne({
    user:{$elemMatch:{email:email}}
}).then(userExists=>{
if(userExists){
    console.log("user_Exsits");

    var orgCode = userExists.orgCode;
    var roleIndex = _.findIndex(userExists.user,{
      mobile:mobile
    });
  var role = (userExists.user[roleIndex]).role;
  
  organisation.findOne({orgCode}).then(orgExists=>{
if(orgExists){
  if(role=="Admin"){

  }
}
else{
    console.log("user not found");
    res.send({
        message:"user_not_found"
    });
}
  }).catch(err=>console.log(err.message));
   
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

});

router.post("/user/changePassword",(req,res,next)=>{
    
});


module.exports = router;
