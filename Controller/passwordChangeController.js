const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const otp = require("../models/otp");
const random = require("../utility/random");
const _ = require("lodash");
const mailer = require("../utility/mailer");
const bcrypt = require("bcryptjs");

//@ send otp
exports.sendOtp = (req, res, next) => {
  var { email } = req.body;

  userData
    .findOne({
      user: { $elemMatch: { email: email } },
    })
    .then((userExists) => {
      if (userExists) {
        console.log("user_Exsits");
        var otpToSend = random.randomOtp();
        var time = new Date();

        otp
          .findOneAndUpdate(
            {
              email,
            },
            {
              otp: otpToSend,
              createdAt: time,
            },
            {
              upsert: true,
              new: true,
            }
          )
          .then((otpSent) => {
            console.log(otpSent);
            console.log("before sending mail");
            otpSent.otpToSend;
            mailer.otpMail(
              otpSent,
              "OTP FOR PASSWORD CHANGE",
              "change your password"
            ); //send otp on mail
            console.log("after sending mail");
            res.send({
              message: "otp_sent",
            });
          })
          .catch((e) => console.log(e));
      } else {
        console.log("user not found");
        res.send({
          message: "user_not_found",
        });
      }
    })
    .catch((err) => console.log(err.message));
};

//@ verify otp
exports.verifyOtp = (req, res, next) => {
  var { email, otpReceived } = req.body;

  console.log("entered " + otpReceived);
  console.log(email);
  otp
    .findOne({
      email,
    })
    .then((changeUser) => {
      if (changeUser) {
        console.log("existing " + changeUser.otp);
        if (changeUser.otp === otpReceived) {
          res.send({
            message: "matched",
          });
        } else {
          res.send({
            message: "not_matched",
          });
        }
      } else {
        res.send({
          message: "otp_expired",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//@ password change
exports.changePassword = (req, res, next) => {
  var { email, newPassword } = req.body;

  userData
    .findOne({
      user: { $elemMatch: { email: email } },
    })
    .then((userFound) => {
      if (userFound) {
        console.log("user_Exsits");

        var orgCode = userFound.orgCode;
        var roleIndex = _.findIndex(userFound.user, {
          email: email,
        });
        console.log(roleIndex);
        console.log(userFound.user[roleIndex]);
        if (roleIndex >= 0) {
          var role = userFound.user[roleIndex].role;

          if (orgCode === "Admin") {
            admin
              .findOne({
                email,
              })
              .then((adminExists) => {
                if (adminExists) {
                  console.log("correct email");

                  adminExists.password = newPassword;

                  console.log(adminExists);
                  adminExists
                    .save()
                    .then((passwordChanged) => {
                      console.log("password changed");
                      res.send({
                        message: "password_changed",
                      });
                    })
                    .catch((err) => {
                      console.log(err.message);
                      res.send({
                        message: "enter_valid_password",
                      });
                    });
                } else {
                  console.log("Invalid_email");
                  res.send({
                    message: "invalid_data",
                  });
                }
              })
              .catch((err) => console.log(err));
          } else {
            console.log("for org teacher student");
            organisation
              .findOne({
                orgCode,
              })
              .then((orgFound) => {
                if (orgFound) {
                  if (role == "Organisation" && orgFound.orgEmail == email) {
                    orgFound.orgPassword = newPassword;
                  } else if (role == "Teacher" || role == "teachers") {
                    newPassword = bcrypt.hashSync(newPassword, 10);
                    var teacherIndex = _.findIndex(orgFound.orgTeachers, {
                      teacherEmail: email,
                    });
                    orgFound.orgTeachers[
                      teacherIndex
                    ].teacherPassword = newPassword;
                  } else if (role == "Student") {
                    newPassword = bcrypt.hashSync(newPassword, 10);

                    var studentIndex = _.findIndex(orgFound.orgStudent, {
                      studentEmail: email,
                    });
                    orgFound.orgStudent[
                      studentIndex
                    ].studentPassword = newPassword;
                  }

                  orgFound
                    .save()
                    .then((passwordChanged) => {
                      console.log("password_changed");
                      res.send({
                        message: "password_changed",
                      });
                    })
                    .catch((err) => {
                      console.log(err.message);
                      res.send({
                        message: "invalid_data",
                      });
                    });
                } else {
                  console.log("Invalid_email");
                  res.send({
                    message: "invalid_data",
                  });
                }
              })
              .catch((err) => console.log(err.message));
          }
        } else {
          console.log("user email not exists");
          res.send({
            message: "invalid_data",
          });
        }
      } else {
        console.log("user email not exists");
        res.send({
          message: "invalid_data",
        });
      }
    })
    .catch((err) => console.log(err.message));
};
