const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");

exports.login = (req, res, next) => {
  const { password, deviceToken } = req.body;
  var mobile = parseFloat(req.body.mobile);
  console.log(req.body);
  userData
    .findOne({
      user: { $elemMatch: { mobile: mobile } },
    })
    .then((userExists) => {
      if (userExists) {
        console.log("user_Exsits");

        var orgCode = userExists.orgCode;
        var roleIndex = _.findIndex(userExists.user, {
          mobile: mobile,
        });
        console.log(roleIndex);
        console.log(userExists.user[roleIndex]);
        if (roleIndex >= 0) {
          var role = userExists.user[roleIndex].role;
        } else {
          role = "";
        }
        console.log(`${orgCode} + ${role} + ${mobile}`);

        if (orgCode === "Admin") {
          admin
            .findOne({
              mobile,
            })
            .then((adminExists) => {
              if (adminExists) {
                console.log("correct phone no");

                if (adminExists.comparePassword(password)) {
                  console.log("correct password");

                  adminExists
                    .generateAuthToken()
                    .then((token) => {
                      res.header("x-auth", token).send({
                        user: {
                          name: adminExists.name,
                          mobile: adminExists.mobile,
                          email: adminExists.email,
                          role: adminExists.role,
                        },
                        message: "loggedIn",
                      });
                    })
                    .catch((err) => console.log(err));
                } else {
                  console.log("Invalid password");
                  res.send({
                    message: "Invalid_Password",
                  });
                }
              } else {
                console.log("Invalid_PhoneNo");
                res.send({
                  message: "Invalid_PhoneNo",
                });
              }
            })
            .catch((err) => console.log(err));
        } else {
          console.log("org or org teacher or org student");
          organisation
            .findOne({
              orgCode,
            })
            .then((orgExists) => {
              if (orgExists) {
                if (role == "Organisation") {
                  if (orgExists.comparePassword(password, role, mobile)) {
                    console.log("correct password");
                    orgExists
                      .generateAuthToken(role, mobile)
                      .then((token) => {
                        console.log("token " + token);
                        orgExists.deviceToken = deviceToken;
                        orgExists.save(),then(deviceTokenSaved=>{
                          res.header("x-auth", token).send({
                            user: {
                              orgName: orgExists.orgName,
                              orgCode: orgExists.orgCode,
                              orgType: orgExists.orgType,
                              orgAddress: orgExists.orgAddress,
                              orgLogo: orgExists.orgLogo,
                              orgEmail: orgExists.orgEmail,
                              role: orgExists.role,
                              orgMobile: orgExists.orgMobile,
                            },
                            message: "loggedIn",
                          });
                        }).catch(err=>{
                          console.log(err.message);
                        })
                        
                      })
                      .catch((err) => console.log(err));
                  } else {
                    console.log("Invalid password");
                    res.send({
                      message: "Invalid_Password",
                    });
                  }
                } else if (role == "Teacher" || role == "teacher") {
                  if (orgExists.comparePassword(password, role, mobile)) {
                    console.log("yes teacher");
                    var teacherDataIndex = _.findIndex(orgExists.orgTeachers, {
                      teacherMobile: mobile,
                    });
                    if (orgExists.orgTeachers[teacherDataIndex].active) {
                      orgExists
                        .generateAuthToken(role, mobile)
                        .then((token) => {
                          console.log("token " + token);
                          var teacher = orgExists.orgTeachers[teacherDataIndex];

                          orgExists.orgTeachers[
                            teacherDataIndex
                          ].deviceToken = deviceToken;

                          orgExists
                            .save()
                            .then((deviceTokenSaved) => {
                              res.header("x-auth", token).send({
                                user: {
                                  teacherName: teacher.teacherName,
                                  teacherAge: teacher.teacherAge,
                                  teacherDesignation:
                                    teacher.teacherDesignation,
                                  teacherCode: teacher.teacherCode,
                                  teacherGender: teacher.teacherGender,
                                  role: teacher.role,
                                  teacherEmail: teacher.teacherEmail,
                                  teacherMobile: teacher.teacherMobile,
                                  teacherClasses: teacher.teachingClasses,
                                  orgCode: orgCode,
                                  orgName: orgExists.orgName,
                                  orgLogo: orgExists.orgLogo,
                                },
                                message: "loggedIn",
                              });
                            })
                            .catch((err) => console.log(err));
                        })
                        .catch((err) => {
                          console.log(err);
                          res.send({
                            message: "Invalid_Password",
                          });
                        });
                    } else {
                      console.log("active user");
                      res.send({
                        message: "inactive_user",
                      });
                    }
                  } else {
                    console.log("Invalid password");
                    res.send({
                      message: "Invalid_Password",
                    });
                  }
                } else if (role == "Student") {
                  if (orgExists.comparePassword(password, role, mobile)) {
                    console.log("yes student");
                    var studentDataIndex = _.findIndex(orgExists.orgStudent, {
                      studentMobile: mobile,
                    });
                    if (orgExists.orgStudent[studentDataIndex].active) {
                      orgExists
                        .generateAuthToken(role, mobile)
                        .then((token) => {
                          console.log("token " + token);
                          orgExists.orgStudent[
                            studentDataIndex
                          ].deviceToken = deviceToken;

                          orgExists
                            .save()
                            .then((deviceTokenSaved) => {
                              var student =
                                orgExists.orgStudent[studentDataIndex];

                              res.header("x-auth", token).send({
                                user: {
                                  studentName: student.studentName,
                                  studentRollNo: student.studentRollNo,
                                  studentClass: student.studentClass,
                                  studentSection: student.studentSection,
                                  studentFatherName: student.studentFatherName,
                                  role: student.role,
                                  studentEmail: student.studentEmail,
                                  studentMobile: student.studentMobile,
                                  studentDOB: student.studentDOB,
                                  studentGender: student.studentGender,
                                  orgCode: orgCode,
                                  orgName: orgExists.orgName,
                                  orgLogo: orgExists.orgLogo,
                                },
                                message: "loggedIn",
                              });
                            })
                            .catch((err) => {
                              console.log(err.message);
                            });
                        })
                        .catch((err) => console.log(err));
                    } else {
                      console.log("active user");
                      res.send({
                        message: "inactive_user",
                      });
                    }
                  } else {
                    console.log("Invalid password");
                    res.send({
                      message: "Invalid_Password",
                    });
                  }
                } else {
                  console.log("Invalid role");
                  res.send({
                    message: "Invalid_role",
                  });
                }
              } else {
                console.log("Invalid_PhoneNo");
                res.send({
                  message: "Invalid_PhoneNo",
                });
              }
            })
            .catch((err) => console.log(err.message));
        }
      } else {
        console.log("user_not_exists");
        console.log("Invalid_PhoneNo");
        res.send({
          message: "Invalid_PhoneNo",
        });
      }
    })
    .catch((err) => console.log(err));
};
