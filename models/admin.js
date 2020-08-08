var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
//@ validation module
const validations = require("../utility/validations");

//@ role - Admin Creates organisations

var adminSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        required: 'Email address is required',
        validate: [validations.validateEmail, "Please fill a valid email address"]
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 5000,
        trim: true,
        required: 'password is required',
        validate: [validations.validatePassword, "Please fill a valid password"]
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

adminSchema.pre('save', function (next) { //can be said as a model method applicable on single document
    const admin = this;
    if (!admin.isModified('password')) {
        return next();
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            else {
                bcrypt.hash(admin.password, salt, (err, hash) => {
                    if (err) return next(err);
                    admin.password = hash;
                    next();
                });
            }
        });
    }
});


var admin = mongoose.model("admin", adminSchema);
module.exports = admin;