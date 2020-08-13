var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
//@ validation module
const validations = require("../utility/validations");

//@ role - Admin Creates organisations

var userDataSchema = new Schema({
orgCode: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  user:[
      {
   role:{
        type: String,
        required: true
    },
    mobile:{
        type: Number,
        required: true,
        unique: true,
        min: 6000000000,
        max: 9999999999
    }
      }
  ]
 
});

//@ match jwt
userDataSchema.statics.findByToken = function (token) { //model method for the whole schema/table
  var User = this;
  console.log("user is "+ User);
  var decoder; //User is the whole schema/table 
  //user is the individual document
  try {
      decoder = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoder");
      console.log(decoder);
  } catch (e) {
      console.log("something error");
      return Promise.reject();
  }
  return User.findOne({
    user:{$elemMatch:{mobile:decoder.mobile}}
  });
}

var userData = mongoose.model("userData", userDataSchema);
module.exports = userData;