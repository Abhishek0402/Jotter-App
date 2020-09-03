const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const _ = require("lodash");
const bcrypt = require("bcryptjs");


exports.register = (req, res, next) => {
  var {
    role,
    mobile,
    orgCode,
    methodToCreate,
    email,
    orgEmail,
    teacherEmail,
    studentEmail,
  } = req.body;

  if (role === "Organisation") {
    var email = orgEmail;
  }
  if (role === "Teacher") {
    var email = teacherEmail;
  }
  if (role === "Student") {
    var email = studentEmail;
  }
  mobile = parseFloat(mobile);
  console.log("registration starts");
  console.log(req.body);
  userData
    .findOne({
      orgCode, 
    })
    .then((orgExists) => {
      if (orgExists) {
        console.log("org Exists");

        var userMobilePresent = _.findIndex(orgExists.user, {
          mobile: mobile,
        });
        var userEmailPresent = _.findIndex(orgExists.user, {
          email: email,
        });
        if (userMobilePresent >= 0) {
          console.log("mobile Already existing");
          res.send({
            message: "invalid_entry",
          });
        } else if (userEmailPresent >= 0) {
          console.log("email Already existing");
          res.send({
            message: "invalid_entry",
          });
        } else if (role == "Teacher" || role == "Student" || role == "Class") {
          if (role == "Teacher" && methodToCreate == "Manual") {
            const {
              teacherName,
              teacherAge,
              teacherDesignation,
              teacherCode,
              teacherGender,
              class_section_subject,
            } = req.body;
            teacherPassword = "Smart@123";

            var teacherPassword = bcrypt.hashSync(teacherPassword, 10);
var teacherMobile= mobile;

var classes = new Array();

for(var classNew in class_section_subject) {
  var classNewFind = _.split(class_section_subject[classNew], '_');
  var classIndex = _.findIndex(classes,{
    teacherClass:classNewFind[0],teacherSection:classNewFind[1]
  });
  if(classIndex>=0){
    var subjectIndex = _.findIndex(classes[classIndex].teachingSubjects,{
    subject:classNewFind[2]
    });
    if(subjectIndex<0){
      classes[classIndex].teachingSubjects.push({
        subject:classNewFind[2]
      })
    }

  }
  else{
    var teacherClass = classNewFind[0];
    var teacherSection = classNewFind[1];
    var subjects = new Array();
    subjects.push({
      subject:classNewFind[2]
    });
    classes.push({
      teacherClass: teacherClass,
      teacherSection: teacherSection,
      teachingSubjects: subjects,
    });
  }

}
console.log(classes);        

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
                  var teacherEmailPresent = _.findIndex(
                    orgFoundForTeacher.orgTeachers,
                    {
                      teacherEmail: teacherEmail,
                    }
                  );
                  var teacherMobilePresent = _.findIndex(orgFoundForTeacher.orgTeachers,{
                    teacherMobile:teacherMobile
                  });
                  var studentEmailPresent= _.findIndex(orgFoundForTeacher.orgStudent,{
                    studentEmail:teacherEmail
                  });
                  var studentMobilePresent = _.findIndex(orgFoundForTeacher.orgStudent,{
                    studentMobile:teacherMobile
                  });
                  var orgEmailPresent = _.findIndex(orgFoundForTeacher,{
                    orgEmail:teacherEmail
                  });
                  var orgMobilePresent = _.findIndex(orgFoundForTeacher,{
                    orgMobile:teacherMobile
                  });
                  if ((teacherCodeExists >= 0)|| (teacherEmailPresent>=0) || (teacherMobilePresent>=0) ||(studentEmailPresent>=0) || (studentMobilePresent>=0) || (orgEmailPresent>=0)|| (orgMobilePresent>=0)) {
                    console.log("teacher code exists");
                    res.send({
                      message: "invalid_entry",
                    });
                  } 
                    else {
                      //push new user to userDate schema
                      orgExists.user.push({
                        role,
                        mobile,
                        email: teacherEmail,
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

                      orgExists
                        .save()
                        .then((teacher) => {
                          orgFoundForTeacher
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
                                message:"invalid_entry",
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
                } else {
                  console.log("org not found");
                  res.send({
                    message: "invalid_entry",
                  });
                }
              })
              .catch((err) => console.log(err.message));
          } 
          
          else if (role == "Student" && methodToCreate == "Manual") {
            const {
              studentName,
              studentRollNo,
              studentClass,
              studentSection,
              studentFatherName,
              studentDOB,
              studentGender,
            } = req.body;
            studentPassword = "Smart@123";

            var studentPassword = bcrypt.hashSync(studentPassword, 10);
var studentMobile= mobile;
            organisation
              .findOne({
                orgCode,
              })
              .then((orgFoundForStudent) => {
                if (orgFoundForStudent) {
                  // var studentRollNoExists = _.findIndex(
                  //   orgFoundForStudent.orgStudent,
                  //   {
                  //     studentRollNo: studentRollNo,
                  //   }
                  // );


                  var teacherEmailPresent = _.findIndex(
                    orgFoundForStudent.orgTeachers,
                    {
                      teacherEmail: studentEmail,
                    }
                  );
                  var teacherMobilePresent = _.findIndex(orgFoundForStudent.orgTeachers,{
                    teacherMobile:studentMobile
                  });
                  var studentEmailPresent= _.findIndex(orgFoundForStudent.orgStudent,{
                    studentEmail:studentEmail
                  });
                  var studentMobilePresent = _.findIndex(orgFoundForStudent.orgStudent,{
                    studentMobile:studentMobile
                  });
                  var orgEmailPresent = _.findIndex(orgFoundForStudent,{
                    orgEmail:studentEmail
                  });
                  var orgMobilePresent = _.findIndex(orgFoundForStudent,{
                    orgMobile:studentMobile
                  });
                
                  if ((teacherEmailPresent>=0) || (teacherMobilePresent>=0) ||(studentEmailPresent>=0) || (studentMobilePresent>=0) || (orgEmailPresent>=0)|| (orgMobilePresent>=0)) {
                    console.log("student roll no. exists");
                    res.send({
                      message: "invalid_entry",
                    });
                  } else {
                  
                      //push new user to userDate schema
                      orgExists.user.push({
                        role,
                        mobile,
                        email: studentEmail,
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
                } else {
                  console.log("org not found");
                  res.send({
                    message: "invalid_entry",
                  });
                }
              })
              .catch((err) => console.log(err.message));
          }
          
          else if (role == "Teacher" && methodToCreate == "File") {
var {list} = req.body;

organisation
.findOne({
  orgCode,
})
.then(async (orgFoundForTeacher) => {
  
  if (orgFoundForTeacher) {
    var dataLength = list.length;
    var c = 0;
    var codeArray = new Array();
    var mobileArray = new Array();
    var emailArray = new Array();


    const orgTeachersMap = await list.map((item) => {
      
      var teacherMobilePresent = _.findIndex(
        orgFoundForTeacher.orgTeachers,
        {
          teacherMobile: parseFloat(item.mobile),
        }
      );

      var teacherEmailPresent = _.findIndex(
        orgFoundForTeacher.orgTeachers,
        {
          teacherEmail: item.email,
        }
      );
      var teacherCodePresent = _.findIndex(
        orgFoundForTeacher.orgTeachers,
        {
          teacherCode: item.code,
        }
      );

      var studentEmailPresent = _.findIndex(orgFoundForTeacher.orgStudent,{
        studentEmail:item.email
      });

      var studentMobilePresent = _.findIndex(orgFoundForTeacher.orgStudent,{
        studentMobile:parseFloat(item.mobile)
      });

      var orgEmailPresent = _.findIndex(orgFoundForTeacher,{
        orgEmail:item.email
      });
      var orgMobilePresent=_.findIndex(orgFoundForTeacher,{
        orgMobile:parseFloat(item.mobile)
      });


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
      } else if((teacherCodePresent>=0) || (teacherEmailPresent>=0)||(teacherMobilePresent>=0)||(studentEmailPresent>=0)||
      (studentMobilePresent>=0)||(orgEmailPresent>=0) || (orgMobilePresent>=0)){
      
        res.send({
          mistake: `invalid entry at line ${item.sno}`,
          message: "invalid_entry",
        });
      }
        else{
          c++;
        }
      
      codeArray.push(item.code);
      mobileArray.push(item.mobile);
      emailArray.push(item.email);
    }); //map ends

        //new map
        if (c == dataLength) {
          const orgTeachersMap = await list.map((item) => {
            //class section subject seperator
            var classes = new Array();
            var classSeperator =_.split(item.class_section_subject,'/');
            console.log(`class seperator ${classSeperator}`);
            var classLength = classSeperator.length;
            console.log(classLength);
            for (var classFinder in classSeperator) {
              var classNewFind = _.split(
                classSeperator[classFinder],
              '_'
              );
              console.log(classNewFind);
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
            console.log(classes);
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
              teacherMobile: parseFloat(item.mobile),
              teachingClasses: classes,
            });
            orgExists.user.push({
              role: item.role,
              mobile: parseFloat(item.mobile),
              email: item.email,
            });
          });
        }
        orgExists
        .save()
        .then((teachersAdded) => {
          console.log("teacher list added");
          orgFoundForTeacher
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
  }
  else {
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
else if (role == "Student" && methodToCreate == "File") {
  var {list} = req.body;

organisation
.findOne({
  orgCode
})
.then(async (orgFoundForStudent) => {
  
  if (orgFoundForStudent) {
    var dataLength = list.length;
    var c = 0;
    var rollNoArray = new Array();
    var mobileArray = new Array();
    var emailArray = new Array();

    const orgStudentMap = await list.map((item) => {
      
      var studentMobilePresent = _.findIndex(
        orgFoundForStudent.orgStudent,
        {
          studentMobile: parseFloat(item.mobile),
        }
      );

      var teacherMobilePresent = _.findIndex(
        orgFoundForStudent.orgTeachers,
        {
          teacherMobile: parseFloat(item.mobile),
        }
      );

      var teacherEmailPresent = _.findIndex(
        orgFoundForStudent.orgTeachers,
        {
          teacherEmail: item.email,
        }
      );
      // var studentRollNoPresent = _.findIndex(
      //   orgFoundForStudent.orgStudent,
      //   {
      //     studentRollNo:item.rollNo
      //   }
      // );

      var studentEmailPresent = _.findIndex(orgFoundForStudent.orgStudent,{
        studentEmail:item.email
      });

      var orgEmailPresent = _.findIndex(orgFoundForStudent,{
        orgEmail:item.email
      });
      var orgMobilePresent=_.findIndex(orgFoundForStudent,{
        orgMobile:parseFloat(item.mobile)
      });

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
      } 
      else if((teacherEmailPresent>=0)||(teacherMobilePresent>=0)||(studentEmailPresent>=0)||
      (studentMobilePresent>=0)||(orgEmailPresent>=0) || (orgMobilePresent>=0)){
console.log("invalid entry at line "+ item.sno);
res.send({
  error:`invalid entry at line ${item.sno}`
});
      }
      else {
        c++;
      }
      rollNoArray.push(item.rollNo);
      mobileArray.push(item.mobile);
      emailArray.push(item.email);
    }); //map ends

           //new map
           if (c == dataLength) {
            const orgStudentEntryMap = await list.map((item) => {
              var studentPassword = "Smart@123";

              studentPassword = bcrypt.hashSync(
                studentPassword,
                10
              );

              orgFoundForStudent.orgStudent.push({
                studentName: item.name,
                studentRollNo: item.rollNo,
                studentClass: item.studentClass,
                studentSection: item.studentSection,
                studentFatherName: item.fatherName,
                role: item.role,
                studentEmail: item.email,
                studentMobile: parseFloat(item.mobile),
                studentDOB: item.dob,
                studentGender: item.gender,
                studentPassword: studentPassword,
              });
              orgExists.user.push({
                role: item.role,
                mobile: parseFloat(item.mobile),
                email: item.email,
              });
            });
          }
          orgExists
          .save()
          .then((studentAdded) => {
            console.log("student list added");
            orgFoundForStudent
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
  }
  else {
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
 else if (role == "Class" && methodToCreate == "Manual") {
            console.log("class creation");
            const { class_section_subject } = req.body;

            organisation
              .findOne({ orgCode })
              .then((orgFoundForClass) => {
                if (orgFoundForClass) {
                  var classes = new Array();

                  var classSeperator = _.split(class_section_subject, ',');
                  for (var classFinder in classSeperator) {
                    var classNewFind = _.split(
                      classSeperator[classFinder],
                      '_'
                    );
                    var classNewFindLength = classNewFind.length;
                    var orgClass = classNewFind[0];
                    var orgSection = classNewFind[1];

                    var classIndex = _.findIndex(orgFoundForClass.orgClasses,{
                      orgClass:orgClass, orgSection:orgSection
                    })
                    if(classIndex>=0){

                      for (var i = 2; i < classNewFindLength; i++) {
                        var subjectIndex =_.findIndex(orgFoundForClass.orgClasses[classIndex].orgSubjects,{
                          subjects:classNewFind[i] 
                        });
                        if(subjectIndex<0){
                          orgFoundForClass.orgClasses[classIndex].orgSubjects.push({ subjects: classNewFind[i] });

                        }
                      }

                    }
                    else{
                      var Subject = new Array();

                      for (var i = 2; i < classNewFindLength; i++) {
                        
                        Subject.push({ subjects: classNewFind[i] });
                      }
                      orgFoundForClass.orgClasses.push({
                        orgClass: orgClass,
                        orgSection: orgSection,
                        orgSubjects: Subject,
                      });


                    }
                   
                  }

                  orgFoundForClass
                    .save()
                    .then((ClassCreated) => {
                      console.log(ClassCreated);
                      res.send({
                        message: "class_created",
                      });
                    })
                    .catch((err) => console.log(err.message));
                } else {
                  console.log("Invalid orgCode");
                  res.send({
                    message: "invalid_entry",
                  });
                }
              })
              .catch((err) => console.log(err));
          } 
          else if (role == "Class" && methodToCreate == "File") {
var {list} = req.body;

            organisation
              .findOne({ orgCode })
              .then(async (orgFoundForClass) => {
                if (orgFoundForClass) {
                  
                          const orgClasses = await list.map((item) => {
                            var teachSubject = _.split(item.subjects, '/');
                            var classIndex = _.findIndex(orgFoundForClass.orgClasses,{
                              orgClass:item.orgClass,orgSection: item.orgSection
                            });
                            if(classIndex>=0){

                              for (var i in teachSubject) {
                                var subjectIndex = _.findIndex(orgFoundForClass.orgClasses[classIndex].orgSubjects,{
                                  subjects:teachSubject[i]
                                });
                                if(subjectIndex<0){
                                  orgFoundForClass.orgClasses[classIndex].orgSubjects.push({
                                    subjects:teachSubject[i]
                                  });
                                }
                            
                            }
                          }
                            else{

                              var orgSubjects = new Array();
                              for (var i in teachSubject) {
                                orgSubjects.push({
                                  subjects: teachSubject[i],
                                });
                              }
                              orgFoundForClass.orgClasses.push({
                                orgClass: item.orgClass,
                                orgSection: item.orgSection,
                                orgSubjects: orgSubjects,
                              });


                            }
                            
                          });

                          orgFoundForClass
                    .save()
                    .then((classCreated) => {
                      console.log("classCreated");
                      res.send({
                        message: "class_created",
                      });
                    })
                    .catch((err) => console.log(err));
                } else {
                  console.log("invalid org Code");
                  res.send({
                    message: "invalid_entry",
                  });
                }
              })
              .catch((err) => console.log(err.message));
          }
        } else {
          console.log("org Code exists");
          res.send({
            message: "invalid_entry",
          });
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
              userData
                .findOne({
                  user: { $elemMatch: { email: email } },
                })
                .then((emailPresent) => {
                  if (emailPresent) {
                    console.log("email exists");
                    res.send({
                      message: "invalid_entry",
                    });
                  } else {
                    if (role == "Admin" && methodToCreate == "Manual") {
                      const { name } = req.body;
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
                            email,
                          },
                        ],
                      });

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
                    } else if (role === "Organisation") {
                      if (methodToCreate == "File") {
                        const file = req.file;
                        var orgLogo = req.file.location;
                      } else if (methodToCreate === "Manual") {
                        var orgLogo =
                          "https://smart-app-upload-csv.s3.ap-south-1.amazonaws.com/edulogofinal.jpg";
                      }
                      const { orgName, orgType, orgAddress } = req.body;
                      var orgPassword = "Smart@123";
                      var orgMobile = mobile;

                      organisation
                        .findOne({ orgEmail })
                        .then((orgEmailExists) => {
                          console.log(orgEmailExists);
                          if (orgEmailExists) {
                            console.log("email_exists");
                            res.send({
                              message: "invalid_entry",
                            });
                          } else {
                            organisation
                              .findOne({ orgMobile: mobile })
                              .then((orgMobileExists) => {
                                if (orgMobileExists) {
                                  console.log("mobile_exists");
                                  res.send({
                                    message: "invalid_entry",
                                  });
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
                                        email: orgEmail,
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
                              .catch((err) => console.log(err.message));
                          }
                        })
                        .catch((err) => {
                          console.log(err.message);
                        });
                    } else {
                      console.log("role not exists");
                      res.send({
                        message: "invalid_entry",
                      });
                    }
                  }
                })
                .catch((err) => {
                  console.log(err.message);
                });
            }
          })
          .catch((err) => console.log(err.message));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
