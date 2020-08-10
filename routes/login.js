const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
// const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");

router.post("/login",(req,res,next)=>{
const {mobile,password}= req.body;

userData.findOne({
  user:{$elemMatch:{mobile:mobile}}
}).then((userExists) => {
 if(userExists){
console.log("user_Exsits");

  var orgCode = userExists.orgCode;
  var role = userExists.user[0].role;

  console.log(`${orgCode} + ${role} + ${mobile}`);

if(orgCode ==="Admin"){
admin.findOne({
mobile
}).then((adminExists) =>{
if(adminExists){
console.log("correct phone no");

if (adminExists.comparePassword(password)) {
  console.log("correct password");


  adminExists.generateAuthToken().then((token) => {
    res.header('x-auth', token).send({
      user: {
        name: adminExists.name,
        mobile: adminExists.mobile,
        email: adminExists.email,
        role:adminExists.role
      },
      message: "loggedIn"
    });
  }).catch(err => console.log(err));

} else {
  console.log("Invalid password");
  res.send({
    message: "Invalid_Password"
  });
}
}
else{
  console.log("Invalid_PhoneNo");
  res.send({
    message:"Invalid_PhoneNo"
  })
}
}).catch(err=>console.log(err));
}

else{
console.log("org or org teacher or org student");
 




}


}
 else{
   console.log("user_not_exists");
   console.log("Invalid_PhoneNo");
   res.send({
     message:"Invalid_PhoneNo"
   });
 }
}).catch(err => console.log(err));
});


module.exports = router;