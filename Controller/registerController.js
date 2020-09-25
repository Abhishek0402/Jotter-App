const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const _ = require("lodash");
const bcrypt = require("bcryptjs");

exports.register = (req, res, next) => {
console.log("hi");
  var {role,mobile,orgCode,methodToCreate,email,orgEmail,teacherEmail,studentEmail,name,orgName,teacherName,studentName} = req.body;

  orgEmail = _.toLower(orgEmail);
  teacherEmail = _.toLower(teacherEmail);
studentEmail = _.toLower(studentEmail);

var loginId = mobile+((_.split((_.toLower(name))," "))[0]);

  if (role === "Organisation") {
    var email = orgEmail;
       loginId = mobile+((_.split((_.toLower(orgName))," "))[0]);
  }
  if (role === "Teacher") {
    var email = teacherEmail;
    loginId = mobile+((_.split((_.toLower(teacherName))," "))[0]);
  }
  if (role === "Student") {
    var email = studentEmail;
    loginId = mobile+((_.split((_.toLower(studentName))," "))[0]);
  }
  email = _.toLower(email);
  mobile = parseFloat(mobile);
console.log(loginId);
  console.log("registration starts");
  console.log(req.body);
  userData
    .findOne({
      orgCode
    })
    .then((orgExists) => {
      if (orgExists) {
        console.log("org Exists");

        var userLoginIdPresent = _.findIndex(orgExists.user, {
          loginId:loginId
        });
       
        if (userLoginIdPresent >= 0) {
          console.log("mobile Already existing");
          res.send({
            message: "invalid_entry",
          });
        } else if (role == "Teacher" || role == "Student" || role == "Class") {
          if (role == "Teacher" && methodToCreate == "Manual") {
            const {
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
                  var teacherloginIdPresent = _.findIndex(
                    orgFoundForTeacher.orgTeachers,
                    {
                      loginId:loginId
                    }
                  );
                  var studentloginIdPresent= _.findIndex(orgFoundForTeacher.orgStudent,{
                    loginId:loginId
                  });
                
                  var orgloginIdPresent = _.findIndex(orgFoundForTeacher,{
                    loginId:loginId
                  });

                  if ((teacherCodeExists >= 0)|| (teacherloginIdPresent>=0) || (studentloginIdPresent>=0)||(orgloginIdPresent>=0)) {
                    console.log("teacher code exists");
                    res.send({
                      message: "invalid_entry",
                    });
                  } 
                    else {
                      //push new user to userDate schema
                      orgExists.user.push({
                        role,
                        loginId,
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
                        loginId: loginId
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
                  var studentRollNoExists = _.findIndex(
                    orgFoundForStudent.orgStudent,
                    {
                      studentRollNo:studentRollNo,
                      studentClass:studentClass,
                      studentSection: studentSection
                    }
                  );
                  var teacherloginIdPresent = _.findIndex(
                    orgFoundForStudent.orgTeachers,
                    {
                      loginId:loginId
                    }
                  );
                  var studentloginIdPresent= _.findIndex(orgFoundForStudent.orgStudent,{
                    loginId:loginId
                  });
                
                  var orgloginIdPresent = _.findIndex(orgFoundForStudent,{
                    loginId:loginId
                  });

                
                  if ((studentRollNoExists>=0) || (teacherloginIdPresent>=0) ||(studentloginIdPresent>=0) || (orgloginIdPresent>=0)) {
                    console.log("student roll no. exists");
                    res.send({
                      message: "invalid_entry",
                    });
                  } else {
                  
                      //push new user to userDate schema
                      orgExists.user.push({
                        role,
                        loginId,
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
                        loginId
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
    var loginIdArray = new Array();


    const orgTeachersMap = await list.map((item) => {
      
      var loginId = item.mobile+((_.split((_.toLower(item.name))," "))[0]);

      var teacherloginIdPresent = _.findIndex(
        orgFoundForTeacher.orgTeachers,
        {
          loginId: loginId,
        }
      );
      console.log("ccc"+loginId);
      var teacherCodePresent = _.findIndex(
        orgFoundForTeacher.orgTeachers,
        {
          teacherCode: item.code,
        }
      );

      var studentloginIdPresent = _.findIndex(orgFoundForTeacher.orgStudent,{
        loginId:loginId
      });

      var orgloginIdPresent=_.findIndex(orgFoundForTeacher,{
        loginId:loginId
      });


      if (
        codeArray.includes(item.code) ||
        loginIdArray.includes(loginId)
      ) {
        console.log("redundant data");
        console.log(
          `${item.code} ${loginId}`
        );
        res.send({
          error: `redundant entry at line ${item.sno}`,
          message: "invalid_entry",
        });
      } else if((teacherCodePresent>=0) || (teacherloginIdPresent>=0)||(studentloginIdPresent>=0)||(orgloginIdPresent>=0)){
      console.log(`${teacherCodePresent} ${teacherloginIdPresent} ${studentloginIdPresent} ${orgloginIdPresent}`);
        res.send({
          mistake: `invalid entry at line ${item.sno}`,
          message: "invalid_entry",
        });
      }
        else{
          c++;
        }
      
      codeArray.push(item.code);
      loginIdArray.push(loginId);
    }); //map ends

        //new map
        if (c == dataLength) {
          const orgTeachersMap = await list.map((item) => {
             var loginId = item.mobile+((_.split((_.toLower(item.name))," "))[0]);

            //class section subject seperator
            var classes = new Array();
            var classSeperator =_.split(item.class_section_subject,'/');

            var classLength = classSeperator.length;

            for (var classFinder in classSeperator) {
              var classNewFind = _.split(classSeperator[classFinder],'_');
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
  item.email = _.toLower(item.email);

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
              loginId:loginId
            });
            orgExists.user.push({
              role: item.role,
              loginId:loginId,
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

    var loginIdArray = new Array();

    const orgStudentMap = await list.map((item) => {

      var loginId = item.mobile+((_.split((_.toLower(item.name))," "))[0]);

      var studentRollNoExists = _.findIndex(
        orgFoundForStudent.orgStudent,
        {
          studentRollNo: item.rollNo,
          studentClass:item.studentClass,
          studentSection: item.studentSection
        }
      );

      var teacherloginIdPresent = _.findIndex(
        orgFoundForStudent.orgTeachers,
        {
          loginId:loginId
        }
      );

      var studentloginIdPresent = _.findIndex(orgFoundForStudent.orgStudent,{
        loginId:loginId
      });

      var orgloginIdPresent=_.findIndex(orgFoundForStudent,{
        loginId:loginId
      });

      if (
        loginIdArray.includes(loginId)
      ) {
        console.log("redundant data");
        console.log(
          `${loginId}`
        );
        res.send({
          error: `redundant entry at line ${item.sno}`,
          message: "invalid_entry",
        });
      } 
      else if((studentRollNoExists>=0)||(teacherloginIdPresent>=0)||(studentloginIdPresent>=0)||
      (orgloginIdPresent>=0)){
        console.log(`${studentRollNoExists} ${teacherloginIdPresent} ${studentloginIdPresent} ${orgloginIdPresent}`);
console.log("invalid entry at line "+ item.sno);
res.send({
  error:`invalid entry at line ${item.sno}`,
  message: "invalid_entry",
});
      }
      else {
        c++;
      }
     loginIdArray.push(loginId);
    }); //map ends

           //new map
           if (c == dataLength) {
            const orgStudentEntryMap = await list.map((item) => {
              var studentPassword = "Smart@123";

              studentPassword = bcrypt.hashSync(
                studentPassword,
                10
              );
               var loginId = item.mobile+((_.split((_.toLower(item.name))," "))[0]);

              item.email = _.toLower(item.email);

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
                loginId:loginId
              });
              orgExists.user.push({
                role: item.role,
                loginId:loginId,
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
console.log(class_section_subject);
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
          .findOne({ user: { $elemMatch: { loginId: loginId } } })
          .then((loginIdPresent) => {
            if (loginIdPresent) {
              console.log("login id exists");
              res.send({
                message: "invalid_entry",
              });
            } else {
                    if (role == "Admin" && methodToCreate == "Manual") {
                      admin.findOne({
                        loginId:loginId
                      }).then(adminExists=>{
if(adminExists){
  console.log("admin exists");
  res.send({
    message: "invalid_entry"
   });
}
else {
  var password = "SmartApp@123";
  const newAdmin = new admin({
    name,
    email,
    password,
    mobile,
    role,
    loginId
  });
  console.log(newAdmin);
  const newUserData = new userData({
    orgCode: "Admin",
    user: [
      {
        role,
        email,
        loginId
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
}
                      }).catch(err=>{
                         console.log(err);
                      });
                
                    } 
                    else if (role === "Organisation") {
                      if (methodToCreate == "File") {
                        const file = req.file;
                        var orgLogo = req.file.location;
                      } else if (methodToCreate === "Manual") {
                        var orgLogo =
                          "https://smartclassapp.s3.amazonaws.com/edulogofinal.jpg";
                      }
                      const {orgType, orgAddress } = req.body;
                      var orgPassword = "Smart@123";
                      var orgMobile = mobile;
console.log(`login id ${loginId}`);
                      organisation
                        .findOne({loginId:loginId})
                        .then((orgIdExists) => {
                          console.log(orgIdExists);
                          if (orgIdExists) {
                            console.log("id_exists");
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
                                    loginId
                                  });

                                  const newUserData = new userData({
                                    orgCode,
                                    user: [
                                      {
                                        loginId:loginId,
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
          .catch((err) => console.log(err.message));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
