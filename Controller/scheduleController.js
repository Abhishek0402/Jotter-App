var gcm = require("node-gcm");

const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const _ = require("lodash");
var moment = require("moment");
const mailer = require("../utility/mailer");

var notificationKey = require("../config/notification");

var sender = new gcm.Sender(notificationKey.serverKey);


//@create schedule
exports.createSchedule = (req, res, next) => {
  var {
    orgCode,
    teacherCode,
    topicScheduled,
    subjectScheduled,
    scheduleDate,
    scheduleTime,
    description,
    studentCount,
    classScheduled,
    sectionScheduled,
    selectedStudents} = req.body;
console.log("aashi");
console.log(selectedStudents);
  var createdAt = moment().format();
  var updatedAt = moment().format();
  
 
  organisation
    .findOne({
      orgCode
    })
    .then((orgFound) => {
      console.log("orgFound");
      if (orgFound) {

        var subjectForMail;
        if (topicScheduled === "Subject") {
          subjectForMail = subjectScheduled;
        } else {
          subjectForMail = "General Talk";
        }

        var orgLogo = orgFound.orgLogo;

        var details = {
          scheduleSubject: subjectForMail,
          scheduleDate: scheduleDate,
          scheduleTime: scheduleTime,
          orgName: orgFound.orgName,
          purpose: "You have a new schedule as below :",
          orgLogo: orgLogo,
          footerMessage:
            "Please, don't forget to join the above schedule on time.",
        };
  
        var subjectMail = "Schedule";
  
        console.log("hellow schedule"+selectedStudents);



        var studentsList = new Array();
var mailList = new Array();
var registrationTokens = new Array();

if(teacherCode==="Organisation"){
  details.scheduleSubject = description;
  registrationTokens.push(orgFound.deviceToken);
  mailList.push(orgFound.orgEmail);
 
details.teacherName = orgFound.orgName;
var messageBody = `You have a new schedule for ${details.scheduleSubject} at ${details.scheduleTime} on ${details.scheduleDate} by ${details.teacherName}.`;
orgFound.notification.push({
  message:messageBody
});
console.log(`studentCount ${studentCount}`);
if(studentCount=="1"){
var std = orgFound.orgStudent.map(student =>{
  console.log("yess");

if(student.active){
  registrationTokens.push(student.deviceToken);
  mailList.push(student.studentEmail);
  student.notification.push({
    message:messageBody
  });
}
});
  }
  else{ 
    var studentSplitter = _.split(selectedStudents, ",");
    for (var selectedStudentDetails in studentSplitter) {
      var studentNewData = _.split(studentSplitter[selectedStudentDetails], "_");
      console.log(studentNewData);
      var studentName = studentNewData[0];
      var studentRollNo = studentNewData[1];
      var studentEmail = studentNewData[2];
      mailList.push(studentEmail);
  
      var studentIndex = _.findIndex(orgFound.orgStudent, {
        studentEmail:studentEmail
      });
      if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
        registrationTokens.push(
          orgFound.orgStudent[studentIndex].deviceToken
        );
    console.log("yess");

        orgFound.orgStudent[studentIndex].notification.push({
          message: messageBody,
        });
      }
      studentsList.push({
        studentRollNo: studentRollNo,
        studentEmail: studentEmail,
        studentName: studentName,
      });
    }
  }
}
else{
  var teacherIndex = _.findIndex(orgFound.orgTeachers, {
    teacherCode: teacherCode,
  });
  registrationTokens.push(orgFound.orgTeachers[teacherIndex].deviceToken);
  mailList.push(orgFound.orgTeachers[teacherIndex].teacherEmail);
  details.teacherName = orgFound.orgTeachers[teacherIndex].teacherName;
  var messageBody = `You have a new schedule for ${details.scheduleSubject} at ${details.scheduleTime} on ${details.scheduleDate} by ${details.teacherName}.`;
  orgFound.orgTeachers[teacherIndex].notification.push({
    message: messageBody,
  });
  //student
  var studentSplitter = _.split(selectedStudents, ",");

  for (var selectedStudentDetails in studentSplitter) {
    var studentNewData = _.split(studentSplitter[selectedStudentDetails], "_");
    console.log(studentNewData);
    var studentName = studentNewData[0];
    var studentRollNo = studentNewData[1];
    var studentEmail = studentNewData[2];
    mailList.push(studentEmail);

    var studentIndex = _.findIndex(orgFound.orgStudent, {
      studentEmail:studentEmail
    });
    if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
      registrationTokens.push(
        orgFound.orgStudent[studentIndex].deviceToken
      );
      orgFound.orgStudent[studentIndex].notification.push({
        message: messageBody,
      });
    }
    studentsList.push({
      studentRollNo: studentRollNo,
      studentEmail: studentEmail,
      studentName: studentName,
    });
  }

}

var message = new gcm.Message({
  // collapseKey: 'demo',
  priority: "high",
  contentAvailable: true,
  delayWhileIdle: true,
  timeToLive: 60,
  // restrictedPackageName: "somePackageName",
  dryRun: false,
  data: {
    title: "New Schedule",
    body: messageBody,
    icon: "ic_launcher",
  },
  notification: {
    title: "New Schedule",
    icon: "ic_launcher",
    body: messageBody,
  },
});


orgFound.schedules.push({
  teacherCode,
  classScheduled,
  sectionScheduled,
  topicScheduled,
  subjectScheduled,
  createdAt,
  updatedAt,
  scheduleDate,
  scheduleTime,
  studentCount,
  description,
  selectedStudents: studentsList,
});

//trigger mailer
mailer.scheduleMail(mailList, details, subjectMail);

sender.sendNoRetry(
  message,
  { registrationTokens: registrationTokens },
  function (err, response) {
    if (err) {
      console.error(err);
      res.send({
        message: "class_not_scheduled",
      });
    } else {
      console.log(response);

      orgFound
        .save()
        .then((scheduleCreate) => {
          console.log("schedule created");

          res.send({
            data: message.params.data,
            notification: message.params.notification,
            message: "class_scheduled",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.send({
            message: "class_not_scheduled",
          });
        });
    }
  }
);
      } else {
        console.log("org not found");
        res.send({
          message: "invalid_orgCode",
        });
      }
    })
    .catch((err) => console.log(err.message));
};

//@ read schedule
exports.readSchedule = (req, res, next) => {
  const { role, orgCode } = req.body;

  organisation
    .findOne({
      orgCode,
    })
    .then((orgFound) => {
      if (orgFound) {
        if(role==="Organisation"){
          var teacherCode = "Organisation";
console.log(role);
console.log(teacherCode);
          var scList = new Array();
          var teacherScheduleList = orgFound.schedules.map((scheduleList) => {
            if (
              scheduleList.teacherCode == teacherCode &&
              scheduleList.active
            ) {
console.log("yes"); 
              if(scheduleList.studentCount){
                studentCount = orgFound.orgStudent.length;
                console.log(`student ${studentCount}`);
              }
              else{
                studentCount= scheduleList.selectedStudents.length;
                console.log(`student yes yes ${studentCount}`);

              }

              scList.push({
                scheduleId: scheduleList.id,
                scheduledClass: scheduleList.classScheduled,
                scheduledSection: scheduleList.sectionScheduled,
                topicScheduled: scheduleList.topicScheduled,
                subjectScheduled: scheduleList.subjectScheduled,
                scheduleDate: scheduleList.scheduleDate,
                scheduleTime: scheduleList.scheduleTime,
                scheduleDescription:scheduleList.description,
                studentALL: scheduleList.studentCount,
                studentCount: studentCount,
              });
            }
          });

          console.log(scList);
          res.send({
            list: scList,
            message: "list_found",
          });
        }
        else if (role == "Teacher" || role == "teacher") {
          const { teacherCode } = req.body;

          var scList = new Array();
          var teacherScheduleList = orgFound.schedules.map((scheduleList) => {
            if (
              scheduleList.teacherCode == teacherCode &&
              scheduleList.active
            ) {
              scList.push({
                scheduleId: scheduleList.id,
                scheduledClass: scheduleList.classScheduled,
                scheduledSection: scheduleList.sectionScheduled,
                topicScheduled: scheduleList.topicScheduled,
                subjectScheduled: scheduleList.subjectScheduled,
                scheduleDate: scheduleList.scheduleDate,
                scheduleTime: scheduleList.scheduleTime,
                scheduleDescription:scheduleList.description,
                studentCount: scheduleList.selectedStudents.length,
              });
            }
          });

          console.log(scList);
          res.send({
            list: scList,
            message: "list_found",
          });
        } else if (role == "Student" || role == "student") {
          const { studentClass, studentSection, studentRollNo } = req.body;

       

          var scList = new Array();
          var studentScheduleList = orgFound.schedules.map((scheduleList) => {

            if(scheduleList.studentCount){
              studentCount = orgFound.orgStudent.length;
            }
            else{
              studentCount= scheduleList.selectedStudents.length
            }


            if (
              scheduleList.classScheduled == studentClass &&
              scheduleList.sectionScheduled == studentSection &&
              scheduleList.active
            ) {
              var roleCheck = _.findIndex(scheduleList.selectedStudents, {
                studentRollNo: studentRollNo,
              });
              if (roleCheck >= 0) {
                if(scheduleList.teacherCode ==="Organisation"){
                  teacherName=orgFound.orgName;
                }
                else{
                  var teacherIndex = _.findIndex(orgFound.orgTeachers, {
                    teacherCode: scheduleList.teacherCode,
                  });
  
                  var teacherName =
                    orgFound.orgTeachers[teacherIndex].teacherName;
                }
              
                scList.push({
                scheduleId: scheduleList.id,
                  topicScheduled: scheduleList.topicScheduled,
                  subjectScheduled: scheduleList.subjectScheduled,
                  scheduleDate: scheduleList.scheduleDate,
                  scheduleTime: scheduleList.scheduleTime,
                  scheduleDescription:scheduleList.description,
                  studentCount,
                  teacherName: teacherName,
                });
              }
            }
          });

          res.send({
            list: scList,
            message: "list_found",
          });
        }
      } else {
        console.log("org not found");
        res.send({
          message: "invalid_orgCode",
        });
      }
    })
    .catch((err) => console.log(err.message));
};

//@ update schedule
exports.updateSchedule = (req, res, next) => {
  var {
    orgCode,
    scheduleId,
    newScheduleDate,
    newScheduleTime,
    teacherCode,
  } = req.body;
  var updatedAt = moment().format();
  console.log(scheduleId);
  organisation
    .findOne({
      orgCode
    })
    .then((orgFound) => {
      if (orgFound) {
        var scheduleIndex = _.findIndex(orgFound.schedules, {
          id: scheduleId,
        });
        if (
          orgFound.schedules[scheduleIndex].active &&
          orgFound.schedules[scheduleIndex].teacherCode == teacherCode
        ) {
          orgFound.schedules[scheduleIndex].scheduleDate = newScheduleDate;
          orgFound.schedules[scheduleIndex].scheduleTime = newScheduleTime;
          orgFound.schedules[scheduleIndex].updatedAt = updatedAt;

          console.log(orgFound.schedules[scheduleIndex]);
          var mailList = new Array();
          var registrationTokens = new Array();


          if (orgFound.schedules[scheduleIndex].topicScheduled === "Subject") {
            var scheduleSubject =
              orgFound.schedules[scheduleIndex].subjectScheduled;
          } else {
            var scheduleSubject = "General Talk";
          }

          var details = {
            scheduleSubject: scheduleSubject,
            scheduleDate: newScheduleDate,
            scheduleTime: newScheduleTime,
            orgName: orgFound.orgName,
            purpose: "You have a update in your schedule as below",
            orgLogo: orgFound.orgLogo,
            footerMessage:
              "Please, don't forget to join the above schedule on time.",
          };
          var subjectMail = "Schedule Change";


          if(teacherCode ==="Organisation"){
  details.scheduleSubject = orgFound.schedules[scheduleIndex].description;

details.teacherName = orgFound.orgName;
var messageBody = `Your schedule for ${details.scheduleSubject} by ${details.teacherName} has been shifted at ${orgFound.schedules[scheduleIndex].scheduleTime} on ${orgFound.schedules[scheduleIndex].scheduleDate}.`;
mailList.push(orgFound.orgEmail);
registrationTokens.push(orgFound.deviceToken);
orgFound.notification.push({
  message:messageBody
});

if(orgFound.schedules[scheduleIndex].studentCount){
  var std = orgFound.orgStudent.map(student =>{
  if(student.active){
    registrationTokens.push(student.deviceToken);
    mailList.push(student.studentEmail);
    student.notification.push({
      message:messageBody
    });
  }
  });
}
else{
 
  var selectedStudents = orgFound.schedules[
    scheduleIndex
  ].selectedStudents.map((std) => {
    mailList.push(std.studentEmail);

    var studentIndex = _.findIndex(orgFound.orgStudent, {
      studentEmail: std.studentEmail,
      studentRollNo: std.studentRollNo,
    });
    if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
      registrationTokens.push(
        orgFound.orgStudent[studentIndex].deviceToken
      );
      orgFound.orgStudent[studentIndex].notification.push({
        message: messageBody,
      });
    }
  });


}
          }
          else{
            var teacherIndex = _.findIndex(orgFound.orgTeachers, {
              teacherCode: teacherCode,
            });
            details.teacherName = orgFound.orgTeachers[teacherIndex].teacherName;
            var messageBody = `Your schedule for ${details.scheduleSubject} by ${details.teacherName} has been shifted at ${orgFound.schedules[scheduleIndex].scheduleTime} on ${orgFound.schedules[scheduleIndex].scheduleDate}.`;
            mailList.push(orgFound.orgTeachers[teacherIndex].teacherEmail);
            registrationTokens.push(
              orgFound.orgTeachers[teacherIndex].deviceToken
            );
            orgFound.orgTeachers[teacherIndex].notification.push({
              message: messageBody,
            });
 
            var selectedStudents = orgFound.schedules[
              scheduleIndex
            ].selectedStudents.map((std) => {
              mailList.push(std.studentEmail);
  
              var studentIndex = _.findIndex(orgFound.orgStudent, {
                studentEmail: std.studentEmail,
                studentRollNo: std.studentRollNo,
              });
              if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
                registrationTokens.push(
                  orgFound.orgStudent[studentIndex].deviceToken
                );
                orgFound.orgStudent[studentIndex].notification.push({
                  message: messageBody,
                });
              }
            });
          }
         
          var message = new gcm.Message({
            // collapseKey: 'demo',
            priority: "high",
            contentAvailable: true,
            delayWhileIdle: true,
            timeToLive: 60,
            // restrictedPackageName: "somePackageName",
            dryRun: false,
            data: {
              title: "Schedule Update",
              body: messageBody,
              icon: "ic_launcher",
            },
            notification: {
              title: "Schedule Update",
              icon: "ic_launcher",
              body: messageBody,
            },
          });

          mailer.scheduleMail(mailList, details, subjectMail);

          sender.sendNoRetry(
            message,
            { registrationTokens: registrationTokens },
            function (err, response) {
              if (err) {
                console.error(err);
                res.send({
                  message: "update_not_allowed",
                });
              } else {
                console.log(response);

                orgFound
                  .save()
                  .then((scheduleUpdated) => {
                    console.log("schedule updated");
                    res.send({
                      data: message.params.data,
                      notification: message.params.notification,
                      message: "schedule_updated",
                    });
                  })
                  .catch((err) => {
                    console.log(err.message);
                    res.send({
                      message: "update_not_allowed",
                    });
                  });
              }
            }
          );
        } else {
          console.log("inactive_schedule or wrong_teacherCode");
          res.send({
            message: "update_not_allowed",
          });
        }
      } else {
        console.log("org not found");
        res.send({
          message: "update_not_allowed",
        });
      }
    })
    .catch((err) => console.log(err.message));
};

//@ delete schedule

exports.deleteSchedule = (req, res, next) => {
  var { orgCode, scheduleId, teacherCode } = req.body;
  var updatedAt = moment().format();
  console.log(scheduleId);
  organisation
    .findOne({
      orgCode
    })
    .then((orgFound) => {
      if (orgFound) {
        var scheduleIndex = _.findIndex(orgFound.schedules, {
          id: scheduleId,
        });
        if (
          orgFound.schedules[scheduleIndex].active &&
          orgFound.schedules[scheduleIndex].teacherCode == teacherCode
        ) {
          orgFound.schedules[scheduleIndex].active = !orgFound.schedules[
            scheduleIndex
          ].active;
          orgFound.schedules[scheduleIndex].updatedAt = updatedAt;

          var mailList = new Array();
          var registrationTokens = new Array();

          if (orgFound.schedules[scheduleIndex].topicScheduled === "Subject") {
            var scheduleSubject =
              orgFound.schedules[scheduleIndex].subjectScheduled;
          } else {
            var scheduleSubject = "General Talk";
          }

          var details = {
            scheduleSubject: scheduleSubject,
            scheduleDate: orgFound.schedules[scheduleIndex].scheduleDate,
            scheduleTime: orgFound.schedules[scheduleIndex].scheduleTime,
            orgName: orgFound.orgName,
            purpose: "Your below schedule has been cancelled",
            orgLogo: orgFound.orgLogo,
            footerMessage: "Sorry for the inconvenience caused.",
          };
          var subjectMail = "Schedule Cancel";


          if(teacherCode ==="Organisation"){
  details.scheduleSubject = orgFound.schedules[scheduleIndex].description;

            details.teacherName = orgFound.orgName;
            var messageBody = `Your schedule for ${details.scheduleSubject} by ${details.teacherName} at ${orgFound.schedules[scheduleIndex].scheduleTime} on ${orgFound.schedules[scheduleIndex].scheduleDate} has been cancelled.`;
            mailList.push(orgFound.orgEmail);
            registrationTokens.push(orgFound.deviceToken);
            orgFound.notification.push({
              message:messageBody
            });
            
            if(orgFound.schedules[scheduleIndex].studentCount){
              var std = orgFound.orgStudent.map(student =>{
              if(student.active){
                registrationTokens.push(student.deviceToken);
                mailList.push(student.studentEmail);
                student.notification.push({
                  message:messageBody
                });
              }
              });
            }
            else{
             
              var selectedStudents = orgFound.schedules[
                scheduleIndex
              ].selectedStudents.map((std) => {
                mailList.push(std.studentEmail);
            
                var studentIndex = _.findIndex(orgFound.orgStudent, {
                  studentEmail: std.studentEmail,
                  studentRollNo: std.studentRollNo,
                });
                if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
                  registrationTokens.push(
                    orgFound.orgStudent[studentIndex].deviceToken
                  );
                  orgFound.orgStudent[studentIndex].notification.push({
                    message: messageBody,
                  });
                }
              });
            
            
            }
                      }
                      else{
                        var teacherIndex = _.findIndex(orgFound.orgTeachers, {
                          teacherCode: teacherCode,
                        });
                        details.teacherName = orgFound.orgTeachers[teacherIndex].teacherName;
                        var messageBody = `Your schedule for ${details.scheduleSubject} by ${details.teacherName} at ${orgFound.schedules[scheduleIndex].scheduleTime} on ${orgFound.schedules[scheduleIndex].scheduleDate} has been cancelled.`;
                        mailList.push(orgFound.orgTeachers[teacherIndex].teacherEmail);
                        registrationTokens.push(
                          orgFound.orgTeachers[teacherIndex].deviceToken
                        );
                        orgFound.orgTeachers[teacherIndex].notification.push({
                          message: messageBody,
                        });
             
                        var selectedStudents = orgFound.schedules[
                          scheduleIndex
                        ].selectedStudents.map((std) => {
                          mailList.push(std.studentEmail);
              
                          var studentIndex = _.findIndex(orgFound.orgStudent, {
                            studentEmail: std.studentEmail,
                            studentRollNo: std.studentRollNo,
                          });
                          if (studentIndex >= 0 && orgFound.orgStudent[studentIndex].active) {
                            registrationTokens.push(
                              orgFound.orgStudent[studentIndex].deviceToken
                            );
                            orgFound.orgStudent[studentIndex].notification.push({
                              message: messageBody,
                            });
                          }
                        });
                      }

          // var today = new Date();
          // var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          // var time = today.getHours() + ":" + today.getMinutes();

          var message = new gcm.Message({
            // collapseKey: 'demo',
            priority: "high",
            contentAvailable: true,
            delayWhileIdle: true,
            timeToLive: 60,
            // restrictedPackageName: "somePackageName",
            dryRun: false,
            data: {
              title: "Schedule Cancelled",
              body: messageBody,
              icon: "ic_launcher",
            },
            notification: {
              title: "Schedule Cancelled",
              icon: "ic_launcher",
              body: messageBody,
            },
          });
          mailer.scheduleMail(mailList, details, subjectMail);
          sender.sendNoRetry(
            message,
            { registrationTokens: registrationTokens },
            function (err, response) {
              if (err) {
                console.error(err);
                res.send({
                  message: "delete_not_allowed",
                });
              } else {
                console.log(response);

                orgFound
                  .save()
                  .then((scheduleUpdated) => {
                    console.log("schedule_deleted");
                    res.send({
                      data: message.params.data,
                      notification: message.params.notification,
                      message: "schedule_deleted",
                    });
                  })
                  .catch((err) => {
                    console.log(err.message);
                    res.send({
                      message: "delete_not_allowed",
                    });
                  });
              }
            }
          );
        } else {
          console.log("inactive_schedule or wrong_teacherCode");
          res.send({
            message: "delete_not_allowed",
          });
        }
      } else {
        console.log("org not found");
        res.send({
          message: "delete_not_allowed",
        });
      }
    })
    .catch((err) => console.log(err.message));
};


//@ get list of students of any schedule
exports.studentList = (req,res,next)=>{
var {orgCode,scheduleId} = req.body;
console.log("start");
organisation.findOne({
  orgCode
}).then(orgFound=>{

  if(orgFound){
var scheduleIndex = _.findIndex(orgFound.schedules,{
  id:scheduleId
});
console.log(req.body);
if(scheduleIndex>=0){
  if(orgFound.schedules[scheduleIndex].studentCount){
    console.log("all students selected");
    res.send({
      message:"all_students_selected"
    });
  }
  else{
    console.log("student lIst");
    res.send({
      list:orgFound.schedules[scheduleIndex].selectedStudents,
      message:"list_found"
    });
  }
}
else{
  console.log("schedule id not found");
  res.send({
    message:"invalid_data"
  });
}
  }
  else{
    console.log("org code not found");
    res.send({
      message:"invalid_data"
    });
  }
}).catch(err=> console.log(err.message));
};