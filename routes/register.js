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
  async (req, res, next) => {
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
          console.log(`user mobile present at ${userPresent}`);
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
              teacherPassword = "Smart@123";

              var teacherPassword = bcrypt.hashSync(teacherPassword, 10);

              console.log(teacherPassword);
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
                          teacherPassword: teacherPassword,
                          teacherMobile: mobile,
                          teachingClasses: classes,
                        });

                        orgFoundForTeacher
                          .save()
                          .then((teacher) => {
                            orgExists
                              .save()
                              .then((user) => {
                                console.log("teacher created");
                                res.send({
                                  message: "teacher_created",
                                });
                              })
                              .catch((err) => {
                                console.log(err.message);
                                res.send({
                                  message,
                                });
                              });
                          })
                          .catch((err) => {
                            console.log(err.message);
                            res.send({
                              message: "invalid_entry",
                            });
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
            } else if (role == "Student" && methodToCreate == "Manual") {
              const {
                studentName,
                studentRollNo,
                studentClass,
                studentSection,
                studentFatherName,
                studentEmail,
                studentDOB,
                studentGender,
              } = req.body;
              studentPassword = "Smart@123";

              var studentPassword = bcrypt.hashSync(studentPassword, 10);

              organisation
                .findOne({
                  orgCode,
                })
                .then((orgFoundForStudent) => {
                  if (orgFoundForStudent) {
                    var studentRollNoExists = _.findIndex(
                      orgFoundForStudent.orgStudent,
                      {
                        studentRollNo: studentRollNo,
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
                          studentEmail: studentEmail,
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
                          studentPassword,
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
                                console.log(err.message);
                                res.send({
                                  message: "invalid_entry",
                                });
                              });
                          })
                          .catch((err) => {
                            console.log(err);
                            res.send({
                              message: "invalid_entry",
                            });
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
            } else if (role == "Teacher" && methodToCreate == "File") {
              const file = req.file;

              organisation
                .findOne({
                  orgCode,
                })
                .then(async (orgFoundForTeacher) => {
                  if (orgFoundForTeacher) {
                    console.log("start processing csv file");

                    await registerController
                      .read(file.originalname)
                      .then(async (data) => {
                        await registerController
                          .csvParser(data.Body.toString())
                          .then(async (data) => {
                            req.addClass = await JSON.stringify(data, null, 2);
                            var arr = JSON.parse(req.addClass);

                            var dataLength = arr.length;
                            var c = 0;
                            var codeArray = new Array();
                            var mobileArray = new Array();
                            var emailArray = new Array();

                            const orgTeachersMap = await arr.map((item) => {
                              
                              var mobilePresent=_.findIndex(orgFoundForTeacher.orgTeachers,{
                                teacherMobile:item.mobile
                              });
                              console.log(`mobile ${mobilePresent}`);


                              var emailPresent = _.findIndex(
                                orgFoundForTeacher.orgTeachers,
                                {
                                  teacherEmail: item.email,
                                }
                              );
                              var codePresent = _.findIndex(
                                orgFoundForTeacher.orgTeachers,
                                {
                                  teacherCode: item.code,
                                }
                              );

                              if (
                                codeArray.includes(item.code) ||
                                mobileArray.includes(item.mobile) ||
                                emailArray.includes(item.email)
                              ) {
                                console.log("redundant data");
                                console.log(
                                  `${item.code}  ${item.email} ${item.mobile}`
                                );
                                res.send({
                                  error: `redundant entry at line ${item.sno}`,
                                  message: "invalid_entry",
                                });
                              } else {
                                if (mobilePresent >= 0) {
                                  console.log("mobile present");
                                  res.send({
                                    mistake: `${item.mobile} already exists`,
                                    message: "invalid_entry",
                                  });
                                } else {
                                  if (emailPresent >= 0) {
                                    console.log("email present");
                                    res.send({
                                      mistake: `${item.email} already exists`,
                                      message: "invalid_entry",
                                    });
                                  } else {
                                    if (codePresent >= 0) {
                                      console.log("teacher code present");
                                      res.send({
                                        mistake: `${item.code} already exists`,
                                        message: "invalid_entry",
                                      });
                                    } else {
                                      c++;
                                    }
                                  }
                                }
                              }
                              codeArray.push(item.code);
                              mobileArray.push(item.mobile);
                              emailArray.push(item.email);
                            }); //map ends

                            //new map
                            if (c == dataLength) {
                              const orgTeachersMap = await arr.map((item) => {
                                //class section subject seperator
                                var classes = new Array();
                                var classSeperator = _.split(
                                  item.class_section_subjects,
                                  ","
                                );
                                var classLength = classSeperator.length;
                                for (var classFinder in classSeperator) {
                                  var classNewFind = _.split(
                                    classSeperator[classFinder],
                                    "_"
                                  );
                                  var classNewFindLength = classNewFind.length;
                                  var teacherClass = classNewFind[0];
                                  var teacherSection = classNewFind[1];
                                  var subjects = new Array();
                                  for (var i = 2; i < classNewFindLength; i++) {
                                    subjects.push({
                                      subject: classNewFind[i],
                                    });
                                  }
                                  classes.push({
                                    teacherClass: teacherClass,
                                    teacherSection: teacherSection,
                                    teachingSubjects: subjects,
                                  });
                                }
                                teacherPassword = "Smart@123";

                                var teacherPassword = bcrypt.hashSync(
                                  teacherPassword,
                                  10
                                );

                                orgFoundForTeacher.orgTeachers.push({
                                  teacherName: item.name,
                                  teacherAge: item.age,
                                  teacherDesignation: item.designation,
                                  teacherCode: item.code,
                                  teacherGender: item.gender,
                                  role: item.role,
                                  teacherEmail: item.email,
                                  teacherPassword: teacherPassword,
                                  teacherMobile: item.mobile,
                                  teachingClasses: classes,
                                });
                                orgExists.user.push({
                                  role: item.role,
                                  mobile: item.mobile,
                                });
                              });
                            }
                          });
                      })
                      .catch((err) => console.log(err.message))
                      .catch((err) => console.log(err.message));

                    orgFoundForTeacher
                      .save()
                      .then((teachersAdded) => {
                        console.log("teacher list added");
                        orgExists
                          .save()
                          .then((teacherCreated) => {
                            console.log("user added");
                            res.send({
                              message: "teachers_added",
                            });
                          })
                          .catch((err) => {
                            console.log(err.message);
                            res.send({
                              message: "invalid_entry",
                            });
                          });
                      })
                      .catch((err) => {
                        console.log(err.message);
                        res.send({
                          message: "invalid_entry",
                        });
                      });
                  } else {
                    console.log("orgCode not found");
                    res.send({
                      message: "invalid_orgCode",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err.message);
                });
            }

            else if(role=="Student" && methodToCreate=="File"){
              const file = req.file;

              organisation
                .findOne({
                  orgCode
                })
                .then(async (orgFoundForStudent) => {
                  if (orgFoundForStudent) {
                    console.log("start processing csv file for students");

                    await registerController
                      .read(file.originalname)
                      .then(async (data) => {
                        await registerController
                          .csvParser(data.Body.toString())
                          .then(async (data) => {
                            req.addClass = await JSON.stringify(data, null, 2);
                            var arr = JSON.parse(req.addClass);

                            var dataLength = arr.length;
                            var c = 0;
                            var rollNoArray = new Array();
                            var mobileArray = new Array();
                            var emailArray = new Array();

                            const orgStudentMap = await arr.map((item) => {
                             var studentMobile = item.mobile;
                              var mobilePresentStudent = _.findIndex(orgFoundForStudent.orgStudent,{
                                studentMobile: item.mobile
                              });

                              console.log(orgFoundForStudent.orgStudent);
                              console.log("mobile "+ item.mobile + " " +mobilePresentStudent); 
                              var emailPresent = _.findIndex(
                                orgFoundForStudent.orgStudent,
                                {
                                  studentEmail: item.email,
                                }
                              );
                              console.log(`email is ${emailPresent}`);
                              var rollNoPresent = _.findIndex(
                                orgFoundForStudent.orgStudent,
                                {
                                  studentRollNo: item.rollNo,
                                }
                              );

                              if (
                                rollNoArray.includes(item.rollNo) ||
                                mobileArray.includes(item.mobile) ||
                                emailArray.includes(item.email)
                              ) {
                                console.log("redundant data");
                                console.log(
                                  `${item.rollNo}  ${item.email} ${item.mobile}`
                                );
                                res.send({
                                  error: `redundant entry at line ${item.sno}`,
                                  message: "invalid_entry",
                                });
                              } else {
                                if (mobilePresentStudent >= 0) {
                                  console.log("mobile present");
                                  res.send({
                                    mistake: `${item.mobile} already exists`,
                                    message: "invalid_entry",
                                  });
                                } else {
                                  if (emailPresent >= 0) {
                                    console.log("email present");
                                    res.send({
                                      mistake: `${item.email} already exists`,
                                      message: "invalid_entry",
                                    });
                                  } else {
                                    if (rollNoPresent >= 0) {
                                      console.log("student roll no. present");
                                      res.send({
                                        mistake: `${item.rollNo} already exists`,
                                        message: "invalid_entry",
                                      });
                                    } else {
                                      c++;
                                    }
                                  }
                                }
                              }
                              rollNoArray.push(item.rollNo);
                              mobileArray.push(item.mobile);
                              emailArray.push(item.email);
                            }); //map ends

                            //new map
                            if (c == dataLength) {
                              const orgStudentEntryMap = await arr.map((item) => {
                               
                               var studentPassword = "Smart@123";

                                studentPassword = bcrypt.hashSync(
                                  studentPassword,
                                  10
                                );

                                orgFoundForStudent.orgStudent.push({
                                  studentName:item.name,
                                  studentRollNo: item.rollNo,
                                  studentClass:item.studentClass,
                                  studentSection:item.section,
                                  studentFatherName: item.fatherName,
                              role: item.role,
                              studentEmail:item.email,
                              studentMobile:item.mobile,
                              studentDOB: item.dob,
                              studentGender:item.gender,
                              studentPassword: studentPassword,
                                });
                                orgExists.user.push({
                                  role: item.role,
                                  mobile: item.mobile,
                                });
                              });
                            }
                          });
                      })
                      .catch((err) => console.log(err.message))
                      .catch((err) => console.log(err.message));

                      orgFoundForStudent
                      .save()
                      .then((studentAdded) => {
                        console.log("student list added");
                        orgExists
                          .save()
                          .then((studentCreated) => {
                            console.log("user added");
                            res.send({
                              message: "students_added",
                            });
                          })
                          .catch((err) => {
                            console.log(err.message);
                            res.send({
                              message: "invalid_entry",
                            });
                          });
                      })
                      .catch((err) => {
                        console.log(err.message);
                        res.send({
                          message: "invalid_entry",
                        });
                      });





                  } else {
                    console.log("orgCode not found");
                    res.send({
                      message: "invalid_orgCode",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err.message);
                });
            }
else if(role=="Class" && methodToCreate=="Manual"){
  console.log("class creation");
  const {class_section_subject}= req.body;
          
  organisation.findOne({orgCode}).then(orgFoundForClass =>{
  if(orgFoundForClass){
  var classes = new Array();

  var classSeperator= _.split(class_section_subject,',');
  for(var classFinder in classSeperator){
  var classNewFind = _.split(classSeperator[classFinder],'_');
  var classNewFindLength = classNewFind.length;
  var orgClass = classNewFind[0];
  var orgSection = classNewFind[1];
  var Subject = new Array();

  for(var i=2;i<classNewFindLength;i++){
      Subject.push({subjects: classNewFind[i]});
  }
  orgFoundForClass.orgClasses.push({
      orgClass: orgClass,
      orgSection: orgSection,
      orgSubjects: Subject
  });

  }
         orgFoundForClass.save().then(ClassCreated =>{
             console.log(ClassCreated);
             res.send({
               message: "class_created"
             });
         }).catch(err=> console.log(err.message));

  }
  else{
      console.log("Invalid orgCode");
      res.send({
          message: "invalid_entry"
      });
  }
  }).catch(err=>console.log(err));

}
else if(role=="Class" && methodToCreate=="File"){
  const file = req.file;
  organisation.findOne({orgCode}).then(async orgFoundForClass =>{
    if(orgFoundForClass){
      
      await registerController.read(file.originalname).then(async data => {
        await registerController.csvParser(data.Body.toString()).then(async data => {
            req.addClass = await JSON.stringify(data, null, 2);
            var arr = JSON.parse(req.addClass);
            const orgClasses = await arr.map((item) => {
                var teachSubject = _.split(item.subjects,",");
                var orgSubjects = new Array();
                for(var i in teachSubject){
orgSubjects.push({
    subjects: teachSubject[i]
});
                }
orgFoundForClass.orgClasses.push({
orgClass:item.orgClass,
orgSection:item.orgSection,
orgSubjects: orgSubjects

})
    });
         }).catch(err => console.log(err));
    }).catch(err => console.log(err));

      orgFoundForClass.save().then(classCreated => {
          console.log("classCreated");
          res.send({
            message: "class_created"
          });
      }).catch(err=>console.log(err));
    }
    else{
      console.log("invalid org Code");
      res.send({
        message: "invalid_entry"
    });
    }
  }).catch(err=> console.log(err.message));
}

          }
        } else {
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
                  var password = "SmartApp@123";
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
                                  message: "invalid_entry",
                                });
                              });
                          })
                          .catch((err) => {
                            console.log(err.message);
                            res.send({
                              message: "invalid_entry",
                            });
                          });
                      }
                    })
                    .catch((err) => console.log(err.message));
                } else if (role == "Organisation" && methodToCreate == "File") {
                  const file = req.file;
                  const { orgName, orgType, orgAddress, orgEmail } = req.body;
                  var orgPassword = "Smart@123";
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
