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
  user: [
    {
      role: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 50,
        required: "Email address is required",
        validate: [
          validations.validateEmail, "Please fill a valid email address",
        ],
      },
      loginId:{
        type:String,
        required: true,
        unique:true
      }
    },
  ],
});

//@ match jwt
userDataSchema.statics.findByToken = function (token) {
  var User = this;
  var decoder;
  try {
    decoder = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoder);
  } catch (e) {
    console.log("something error");
    return Promise.reject();
  }
  return User.findOne({
    user: { $elemMatch: { loginId: decoder.loginId,
    email:decoder.email,
    role: decoder.role
    }}
  });
};

var userData = mongoose.model("userData", userDataSchema);
module.exports = userData;
