const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const authenticate = (req,res,next) => {
    var token = req.header('x-auth');
    console.log(token);
  userData.findByToken(token).then((userExists) => {
     if(!userExists){
     console.log('user not exists');
     return Promise.reject();
   } 
   console.log("hello");
   console.log(userExists);
  console.log("bye");
  //  req.user = user;
  //  req.token = token;
  //  console.log("email is "+ req.admin.email);
   console.log("token matched");
   next();                //TO CALL THE NEXT MIDDLEWARE
  }).catch((e) => {
    console.log("Unauthorized access");
    res.status(401).send({
      message: "Unauthorized_access"
    });
  });
  };

  module.exports = {authenticate};
   