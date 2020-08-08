var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//@ validation module
const validations = require("../utility/validations");

//@ role - Admin Creates organisations

var userDataSchema = new Schema({
organisation: {
    type: String,
    default:"Admin",
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
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
});



var userData = mongoose.model("userData", userDataSchema);
module.exports = userData;