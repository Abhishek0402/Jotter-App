var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//validations module
const validations = require("../utility/validations");

var changeSchema = new Schema({
    email: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 50,
        required: 'Email address is required',
        validate: [validations.validateEmail, "Please fill a valid email address"]
    },
    otp: {
        type: String
    },
    createdAt: {
        type: Date
    }
});

//automatic delete the entry from db using the index

changeSchema.index({
    createdAt:1
}, {
    expireAfterSeconds: 86400
});


var changePassword = mongoose.model("otp", changeSchema);
module.exports = changePassword;