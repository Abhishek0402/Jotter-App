const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
const registerController = require("../Controller/registerController");
var fs = require("fs");
var csv = require("fast-csv");
const bcrypt = require("bcryptjs");
const authController = require("../Controller/authController");

router.post(
  "/register",
  authController.authenticate,
  registerController.uploadCsv.single("file"),
  (req, res, next) => {
    const { role, mobile, orgCode, methodToCreate } = req.body;
    console.log("registration api");
    userData
      .findOne({
        orgCode,
      })
      .then(async (orgExists) => {
        if (orgExists) {
          console.log("org Exists");

          var userPresent = _.findIndex(orgExists.user, {
            mobile: mobile,
          });

          if (userPresent >= 0) {
            console.log("mobile Already existing");
            res.send({
              message: "invalid_entry",
            });
          } else {
            if (role == "Teacher" && methodToCreate == "Manual") {
              const {
                teacherName,
                teacherAge,
                teacherDesignation,
                teacherCode,
                teacherGender,
                teacherEmail,
                class_section_subject,
              } = req.body;
              teacherPassword = teacherName + "@AB12";

              var classes = new Array();
              var classSeperator = _.split(class_section_subject, ",");
              for (var classFinder in classSeperator) {
                var classNewFind = _.split(classSeperator[classFinder], "_");
                var classNewFindLength = classNewFind.length;
                var teacherClass = classNewFind[0];
                var teacherSection = classNewFind[1];
                classNewFind = _.reverse(classNewFind);
                var subjects = new Array();

                for (var i = 0; i < classNewFindLength - 2; i++) {
                  subjects.push({ subject: classNewFind[i] });
                }
                classes.push({
                  teacherClass: teacherClass,
                  teacherSection: teacherSection,
                  teachingSubjects: subjects,
                });
              }
              //classes array is for teachingClasses

              organisation
                .findOne({
                  orgCode,
                })
                .then((orgFoundForTeacher) => {
                  if (orgFoundForTeacher) {
                    var teacherCodeExists = _.findIndex(
                      orgFoundForTeacher.orgTeachers,
                      {
                        teacherCode: teacherCode,
                      }
                    );
                    if (teacherCodeExists >= 0) {
                      console.log("teacher code exists");
                      res.send({
                        message: "invalid_entry",
                      });
                    } else {
                      var teacherEmailPresent = _.findIndex(
                        orgFoundForTeacher.orgTeachers,
                        {
                          teacherEmail: teacherEmail,
                        }
                      );

                      if (teacherEmailPresent >= 0) {
                        console.log("teacher email exists");
                        res.send({
                          message: "invalid_entry",
                        });
                      } else {
                        //push new user to userDate schema
                        orgExists.user.push({
                          role,
                          mobile,
                        });

                        orgFoundForTeacher.orgTeachers.push({
                          teacherName,
                          teacherAge,
                          teacherDesignation,
                          teacherCode,
                          teacherGender,
                          role,
                          teacherEmail,
                          teacherPassword,
                          teacherMobile: mobile,
                          teachingClasses: classes,
                        });

                        orgExists
                          .save()
                          .then((user) => {
                            console.log("teacher created");
                            orgFoundForTeacher
                              .save()
                              .then((teacher) => {
                                res.send({
                                  message: "teacher_created",
                                });
                              })
                              .catch((err) =>{console.log(err.message)
                              res.send({
                                message:"invalid_entry"
                              });
                              });
                          })
                          .catch((err) =>{
                            console.log(err.message);
                            res.send({
                              message
                            })
                          });
                      }
                    }
                    
                  } else {
                    console.log("org not found");
                    res.send({
                      message: "invalid_entry",
                    });
                  }
                })
                .catch((err) => console.log(err.message));
            }

            else if(role=="Student" && methodToCreate=="Manual"){
              const {studentName,studentRollNo,studentClass,studentSection,
                studentFatherName,studentEmail,studentDOB,studentGender} = req.body;
             studentPassword = studentName+"@AB12";

             organisation
             .findOne({
               orgCode
             })
             .then((orgFoundForStudent) => {
               if (orgFoundForStudent) {
                 var studentRollNoExists = _.findIndex(
                   orgFoundForStudent.orgStudent,
                   {
                     studentRollNo:studentRollNo
                   }
                 );
                 if (studentRollNoExists >= 0) {
                   console.log("student roll no. exists");
                   res.send({
                     message: "invalid_entry",
                   });
                 } else {
                   var studentEmailPresent = _.findIndex(
                    orgFoundForStudent.orgStudent,
                     {
                       studentEmail:studentEmail
                     }
                   );

                   if (studentEmailPresent >= 0) {
                     console.log("student email exists");
                     res.send({
                       message: "invalid_entry",
                     });
                   } else {
                     //push new user to userDate schema
                     orgExists.user.push({
                       role,
                       mobile,
                     });

                     orgFoundForStudent.orgStudent.push({
                      studentName,
                      studentRollNo,
                      studentClass,
                      studentSection,
                      studentFatherName,
                      role,
                      studentEmail,
                      studentMobile: mobile,
                      studentDOB,
                      studentGender,
                      studentPassword
                     });

                     orgExists
                       .save()
                       .then((user) => {
                         console.log("student created");
                         orgFoundForStudent
                           .save()
                           .then((student) => {
                             res.send({
                               message: "student_created",
                             });
                           })
                           .catch((err) => {
                             console.log(err.message)
                             res.send({
                               message:"invalid_entry"
                             })});
                       })
                       .catch((err) =>{ console.log(err)
                        res.send({
                          message:"invalid_entry"
                        })
                      });
                      
                   }
                 }
               }
                else {
                 console.log("org not found");
                 res.send({
                   message: "invalid_entry",
                 });
               }
             })
             .catch((err) => console.log(err.message));
            }



            
          }
        }

        else {
          userData
            .findOne({ user: { $elemMatch: { mobile: mobile } } })
            .then((mobilePresent) => {
              if (mobilePresent) {
                console.log("mobile exists");
                res.send({
                  message: "invalid_entry",
                });
              } else {
                if (role == "Admin" && methodToCreate == "Manual") {
                  const { name, email } = req.body;
                  var password = name + "@AB12";
                  const newAdmin = new admin({
                    name,
                    email,
                    password,
                    mobile,
                    role,
                  });
                  console.log(newAdmin);
                  const newUserData = new userData({
                    orgCode: "Admin",
                    user: [
                      {
                        mobile,
                        role,
                      },
                    ],
                  });
                  admin
                    .findOne({ mobile })
                    .then((adminExists) => {
                      if (adminExists) {
                        if (adminExists.email == email) {
                          console.log("Admin email exists");
                          res.send({
                            message: "invalid_entry",
                          });
                        } else if (adminExists.mobile == mobile) {
                          console.log("Admin mobile exists");
                          res.send({
                            message: "invalid_entry",
                          });
                        }
                      } else {
                        console.log(email);
                        newAdmin
                          .save()
                          .then((admin) => {
                            console.log("Admin_Created");
                            newUserData
                              .save()
                              .then((adminCreated) => {
                                res.send({
                                  message: "admin_created",
                                });
                              })
                              .catch((err) => {
                                console.log(err.message);
                                res.send({
                                  message:"invalid_entry"
                                });
                              });
                          })
                          .catch((err) => {
                            console.log(err.message);
                            res.send({
                              message:"invalid_entry"
                            });
                          });
                      }
                    })
                    .catch((err) => console.log(err.message));
                } 
                else if (role == "Organisation" && methodToCreate == "File") {
                  const file = req.file;
                  const { orgName, orgType, orgAddress, orgEmail } = req.body;
                  var orgPassword = orgName + "@AB12";
                  var orgMobile = mobile;
                  var orgLogo = req.file.location;
                  console.log(orgLogo);
                  console.log(req.body.role);

                  organisation
                    .findOne({ orgEmail })
                    .then((orgEmailExists) => {
                      console.log(orgEmailExists);
                      if (orgEmailExists) {
                        if (orgEmailExists.orgEmail == orgEmail) {
                          console.log("email_exists");
                          res.send({
                            message: "invalid_entry",
                          });
                        } else if (orgEmailExists.orgMobile == orgMobile) {
                          console.log("mobile_exists");
                          res.send({
                            message: "invalid_entry",
                          });
                        }
                      } else {
                        const newOrg = new organisation({
                          orgName,
                          orgCode,
                          orgType,
                          orgAddress,
                          orgLogo,
                          orgEmail,
                          orgPassword,
                          role,
                          orgMobile,
                        });

                        const newUserData = new userData({
                          orgCode,
                          user: [
                            {
                              mobile: orgMobile,
                              role,
                            },
                          ],
                        });
                        newOrg
                          .save()
                          .then((org) => {
                            console.log("Org_Created");
                            newUserData
                              .save()
                              .then((orgCreated) => {
                                res.send({
                                  message: "org_created",
                                });
                              })
                              .catch((err) => {
                                console.log("abv");
                                console.log(err.message);
                                res.send({
                                  message: "invalid_entry",
                                });
                              });
                          })
                          .catch((err) => {
                            console.log("vdd");
                            console.log(err.message);
                            res.send({
                              message: "invalid_entry",
                            });
                          });
                      }
                    })
                    .catch((err) => {
                      console.log(err.message);
                    });
                } else {
                  console.log("org Code not exists");
                  res.send({
                    message: "invalid_entry",
                  });
                }
              }
            })
            .catch((err) => console.log(err.message));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

module.exports = router;
