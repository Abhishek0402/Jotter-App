const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");

exports.login = (req, res, next) => {
  var { password, deviceToken,mobile,firstName} = req.body;
  console.log(req.body);
  firstName= _.toLower(firstName);
  var loginId = mobile+firstName;
mobile = parseFloat(mobile);
  userData
    .findOne({
      user: { $elemMatch: {loginId:loginId } },
    })
    .then((userExists) => {
      if (userExists) {
        console.log("user_Exsits");

        var orgCode = userExists.orgCode;
        var roleIndex = _.findIndex(userExists.user, {
          loginId:loginId
        });
        console.log(roleIndex);
        console.log(userExists.user[roleIndex]);
        if (roleIndex >= 0) {
          var role = userExists.user[roleIndex].role;
        } else {
          role = "";
        }
        console.log(`${orgCode} + ${role} + ${loginId}`);

        if (orgCode === "Admin") {
          admin
            .findOne({
             loginId
            })
            .then((adminExists) => {
              if (adminExists) {
                console.log("correct loginId");

                if (adminExists.comparePassword(password)) {
                  console.log("correct password");

                  adminExists
                    .generateAuthToken()
                    .then((token) => {
                      res.header("x-auth", token).send({
                        user: {
                          name: adminExists.name,
                          mobile: mobile,
                          loginId:loginId,
                          email: adminExists.email,
                          role: adminExists.role,
                        },
                        message: "loggedIn",
                      });
                    })
                    .catch((err) => console.log(err));
                } else {
                  console.log("Invalid_details");
                  res.send({
                    message: "Invalid_details",
                  });
                }
              } else {
                console.log("Invalid_details");
                res.send({
                  message: "Invalid_details",
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
                  if (orgExists.comparePassword(password, role, loginId)) {
                    console.log("correct password");
                    var email = orgExists.orgEmail;
                    orgExists
                      .generateAuthToken(role, loginId,email)
                      .then((token) => {
                        console.log("token " + token);
                        orgExists.deviceToken = deviceToken;
                        orgExists.save().then(deviceTokenSaved=>{
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
                              loginId:loginId
                            },
                            message: "loggedIn",
                          });
                        }).catch(err=>{
                          console.log(err.message);
                        })
                        
                      })
                      .catch((err) => console.log(err));
                  } else {
                    console.log("Invalid_details");
                    res.send({
                      message: "Invalid_details",
                    });
                  }
                } else if (role == "Teacher" || role == "teacher") {
                  if (orgExists.comparePassword(password, role, loginId)) {
                    console.log("yes teacher");
                    var teacherDataIndex = _.findIndex(orgExists.orgTeachers, {
                      loginId:loginId
                    });
                    var email = orgExists.orgTeachers[teacherDataIndex].teacherEmail;
                    if (orgExists.orgTeachers[teacherDataIndex].active) {
                      orgExists
                        .generateAuthToken(role, loginId,email)
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
                                  loginId:loginId
                                },
                                message: "loggedIn",
                              });
                            })
                            .catch((err) => console.log(err));
                        })
                        .catch((err) => {
                          console.log(err);
                          res.send({
                            message: "Invalid_details",
                          });
                        });
                    } else {
                      console.log("active user");
                      res.send({
                        message: "inactive_user",
                      });
                    }
                  } else {
                    console.log("Invalid_details");
                    res.send({
                      message: "Invalid_details",
                    });
                  }
                } else if (role == "Student") {
                  if (orgExists.comparePassword(password, role, loginId)) {
                    console.log("yes student");
                    var studentDataIndex = _.findIndex(orgExists.orgStudent, {
                      loginId:loginId
                    });
                    if (orgExists.orgStudent[studentDataIndex].active) {
                      var email = orgExists.orgStudent[studentDataIndex].studentEmail;
                      orgExists
                        .generateAuthToken(role,loginId,email)
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
                                  loginId:loginId,
                                  studentId: student.id
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
                    console.log("Invalid_details");
                    res.send({
                      message: "Invalid_details",
                    });
                  }
                } else {
                  console.log("Invalid_details");
                  res.send({
                    message: "Invalid_details",
                  });
                }
              } else {
                console.log("Invalid_details");
                res.send({
                  message: "Invalid_details",
                });
              }
            })
            .catch((err) => console.log(err.message));
        }
      } else {
        console.log("user_not_exists");
        console.log("Invalid_details");
        res.send({
          message: "Invalid_details",
        });
      }
    })
    .catch((err) => console.log(err));
};
