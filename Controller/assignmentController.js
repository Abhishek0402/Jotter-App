const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
var gcm = require("node-gcm");
var moment = require("moment");
const mailer = require("../utility/mailer");
const _ = require("lodash");

var notificationKey = require("../config/notification");

var sender = new gcm.Sender(notificationKey.serverKey);

//@ create assignment
exports.createAssignment = (req, res, next) => {
  var {
    orgCode,
    teacherCode,
    assignmentTitle,
    description,
    classAssignment,
    sectionAssignment,
    subjectAssignment,
    assignmentDate,
    assignmentTime,
  } = req.body;
  console.log(req.body);

  organisation.findOne({orgCode}).then(orgFound =>{
if(orgFound){
 var teacherIndex = _.findIndex(orgFound.orgTeachers,{
 teacherCode:teacherCode
 });
 if(teacherIndex>=0){
    var orgLogo = orgFound.orgLogo;

    var details = {
      orgLogo: orgLogo,
      purpose: "You have a new assignment as below:",
      assignmentTitle:assignmentTitle,
      subjectAssignment: subjectAssignment,
      teacherName: orgFound.orgTeachers[teacherIndex].teacherName,
      orgName: orgFound.orgName,
      footerMessage:
        "Please, submit the assignment within time",
    };

    var subjectMail = "New Assignment";
    var mailList = new Array();
    var registrationTokens = new Array();
 registrationTokens.push(orgFound.orgTeachers[teacherIndex].deviceToken);
mailList.push(orgFound.orgTeachers[teacherIndex].teacherEmail);

var messageBody = `You have a new assignment ${assignmentTitle} for ${subjectAssignment} by ${details.teacherName}`
orgFound.orgTeachers[teacherIndex].notification.push({
  message: messageBody,
});

var studentList = new Array();
  var stdList = orgFound.orgStudent.map((student)=>{
    if(student.studentClass === classAssignment && student.studentSection === sectionAssignment && student.active){
      studentList.push({
        studentId: student.id,
        active:0
      });

      mailList.push(student.studentEmail);
      registrationTokens.push(student.deviceToken);
      var studentIndex = _.findIndex(orgFound.orgStudent,{
        studentClass:classAssignment,studentSection:sectionAssignment
      });
 
      orgFound.orgStudent[studentIndex].notification.push({
        message: messageBody,
      });
      
    }
  });

  var message = new gcm.Message({
    // collapseKey: 'demo',
    priority: "high",
    contentAvailable: true,
    delayWhileIdle: true,
    timeToLive: 60,
    // restrictedPackageName: "somePackageName",
    dryRun: false,
    data: {
      title: "New Assignment",
      body: messageBody,
      icon: "ic_launcher",
    },
    notification: {
      title: "New Assignment",
      icon: "ic_launcher",
      body: messageBody,
    },
  });

  var updatedAt = moment().format();
console.log(req.file.location);
  orgFound.assignment.push({
    teacherCode,
    assignmentTitle,
    classAssignment,
    sectionAssignment,
    subjectAssignment,
updatedAt,
assignmentDate,
assignmentTime,
description,
file:req.file.location,
selectedStudents: studentList
  });

  mailer.assignmentMail(mailList, details, subjectMail);
  console.log(`${registrationTokens} ${mailList}`);

  sender.sendNoRetry(
    message,
    { registrationTokens: registrationTokens },
    function (err, response) {
      if (err) {
        console.error(err);
        res.send({
          message: "assignment_not_created",
        });
      } else {
        console.log(response);
  
        orgFound
          .save()
          .then((assignmentCreate) => {
            console.log("assignment created");
  
            res.send({
              data: message.params.data,
              notification: message.params.notification,
              message: "assignment_created",
            });
          })
          .catch((err) => {
            console.log(err.message);
            res.send({
              message: "assignment_not_created",
            });
          });
      }
    }
  );

 }
 else{
     console.log("teacher not found");
     res.send({
         message:"invalid_teacherCode"
     });
 }
}
else{
    console.log("org not found");
    res.send({
        message:"invalid_orgCode"
    });
}
  }).catch(err=>console.log(err));

};


//@ read assignment
exports.readAssignment = (req, res, next) => {
  var {orgCode,role} = req.body;

  organisation.findOne({orgCode}).then(orgFound=>{
    if(orgFound){
 if(role ==="Teacher"){
var {teacherCode} = req.body;
var assList = new Array();
var teacherAssignmentList = orgFound.assignment.map((assignmentList) => {
  if (
    assignmentList.teacherCode == teacherCode &&
   assignmentList.active
  ) {
    var c=0;
     var studentList  = assignmentList.selectedStudents.map(stdCount => {
        if(stdCount.active)c++;
     });
    assList.push({
      assignmentId: assignmentList.id,
      assignmentTitle:assignmentList.assignmentTitle,
      classAssignment:assignmentList.classAssignment,
      sectionAssignment:assignmentList.sectionAssignment,
      subjectAssignment:assignmentList.subjectAssignment,
      assignmentDate: assignmentList.assignmentDate,
      assignmentTime:assignmentList.assignmentTime,
      description:assignmentList.description,
      file: assignmentList.file,
      submitCount: c     
    });
  }
});

console.log(assList);
res.send({
  list: assList,
  message: "list_found",
});
 }
 else if(role === "Student"){
  const { studentClass, studentSection,studentId} = req.body;
  var assList = new Array();
  var studentAssignmentList = orgFound.assignment.map((assignmentList) => {

    if (
      assignmentList.classAssignment == studentClass &&
      assignmentList.sectionAssignment == studentSection &&
      assignmentList.active
    ) {
          var teacherIndex = _.findIndex(orgFound.orgTeachers, {
            teacherCode: assignmentList.teacherCode,
          });

          var teacherName =
            orgFound.orgTeachers[teacherIndex].teacherName;
            var c=0;
            var sumbitCheck = 0;
            var studentList  = assignmentList.selectedStudents.map(stdCount => {
               if(stdCount.active)c++;
            });
            var studentSubmissionIndex = _.findIndex(assignmentList.selectedStudents,{
              studentId: studentId
            });

            if(studentSubmissionIndex>=0){
              console.log(studentSubmissionIndex);
    var remark;
    console.log(assignmentList.selectedStudents[studentSubmissionIndex].teacherRemark);
              if(typeof(assignmentList.selectedStudents[studentSubmissionIndex].teacherRemark)==="undefined"){
              remark = "";
            }
            else {
              remark =assignmentList.selectedStudents[studentSubmissionIndex].teacherRemark;
            }
              assList.push({
                assignmentId: assignmentList.id,
                assignmentTitle:assignmentList.assignmentTitle,
                subjectAssignment:assignmentList.subjectAssignment,
                assignmentDate: assignmentList.assignmentDate,
                assignmentTime:assignmentList.assignmentTime,
                description:assignmentList.description,
                file: assignmentList.file,
                submitCount: c,
                teacherRemark:remark,
                active:assignmentList.selectedStudents[studentSubmissionIndex].active  
              });

            }
       
      }
  
  });

  res.send({
    list: assList,
    message: "list_found",
  });
 }
    }
    else{
      console.log("org not found");
      res.send({
        message: "invalid_orgCode",
      });
    }
  }).catch(err=>console.log(err));
};

exports.deleteAssignment = (req, res, next) => {
  var {assignmentId,orgCode,teacherCode} = req.body;
  var updatedAt = moment().format();
  organisation
    .findOne({
      orgCode
    })
    .then((orgFound) => {
      if (orgFound) {
        var assignmentIndex = _.findIndex(orgFound.assignment, {
          id: assignmentId,
        });
        if (
          assignmentIndex>=0 &&
          orgFound.assignment[assignmentIndex].active &&
          orgFound.assignment[assignmentIndex].teacherCode == teacherCode
        ) {
          orgFound.assignment[assignmentIndex].active = !orgFound.assignment[assignmentIndex].active;
          orgFound.assignment[assignmentIndex].updatedAt = updatedAt;
          var orgLogo = orgFound.orgLogo;
          var teacherIndex = _.findIndex(orgFound.orgTeachers,{
            teacherCode:teacherCode
            });
          var details = {
            orgLogo: orgLogo,
            purpose: "Your below assignment has been canceled:",
            assignmentTitle: orgFound.assignment[assignmentIndex].assignmentTitle,
            subjectAssignment: orgFound.assignment[assignmentIndex].subjectAssignment,
            teacherName: orgFound.orgTeachers[teacherIndex].teacherName,
            orgName: orgFound.orgName,
            footerMessage:
              "Appologize for the same",
          };
          var subjectMail = "Assignment Cancel";
          var mailList = new Array();
          var registrationTokens = new Array();
          registrationTokens.push(orgFound.orgTeachers[teacherIndex].deviceToken);
          mailList.push(orgFound.orgTeachers[teacherIndex].teacherEmail);
          
          var messageBody = `Your assignment ${details.assignmentTitle} for ${details.subjectAssignment} by ${details.teacherName} has been cancelled`
          orgFound.orgTeachers[teacherIndex].notification.push({
            message: messageBody,
          });

          var studentList = new Array();
          var stdList = orgFound.orgStudent.map((student)=>{
            if(student.studentClass === orgFound.assignment[assignmentIndex].classAssignment && student.studentSection === orgFound.assignment[assignmentIndex].sectionAssignment && student.active){
              
        
              mailList.push(student.studentEmail);
              registrationTokens.push(student.deviceToken);
              var studentIndex = _.findIndex(orgFound.orgStudent,{
                studentClass:orgFound.assignment[assignmentIndex].classAssignment,studentSection:orgFound.assignment[assignmentIndex].sectionAssignment
              });
         
              orgFound.orgStudent[studentIndex].notification.push({
                message: messageBody,
              });
              
            }
          });
console.log(messageBody);
          var message = new gcm.Message({
            // collapseKey: 'demo',
            priority: "high",
            contentAvailable: true,
            delayWhileIdle: true,
            timeToLive: 60,
            // restrictedPackageName: "somePackageName",
            dryRun: false,
            data: {
              title: "Assignment Cancelled",
              body: messageBody,
              icon: "ic_launcher",
            },
            notification: {
              title: "Assignment Cancelled",
              icon: "ic_launcher",
              body: messageBody,
            },
          });
          mailer.assignmentMail(mailList, details, subjectMail);
          console.log(mailList);
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
                    console.log("assignment_deleted");
                    res.send({
                      data: message.params.data,
                      notification: message.params.notification,
                      message: "assignment_deleted",
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

exports.readStudent = (req, res, next) => {
  var {orgCode,assignmentId,role,studentId}=req.body;
  organisation.findOne({
    orgCode 
  },{
orgStudent:1,
assignment:1
  }).then(dataFound =>{
    if(dataFound){
      console.log("123");
      if(role=="Teacher"){
        var assignmentIndex = _.findIndex(dataFound.assignment,{
          id:assignmentId
        });
        if(assignmentIndex>=0){
          var dataList = new Array();
var listStudent = dataFound.assignment[assignmentIndex].selectedStudents.map((response)=>{
   var studentIndex = _.findIndex(dataFound.orgStudent,{
     id:response.studentId
   });
  
if(response.teacherRemark ==="undefined")response.teacherRemark="";
if(response.studentDescription==="undefined") response.studentDescription= "";
if(response.studentFile==="undefined") response.studentFile="";
if(response.submitDate==="undefined") response.submitDate="";
if(response.submitTime==="undefined") response.submitTime="";
console.log(`${response.teacherRemark} ${response.studentDescription} ${response.studentFile} ${response.submitDate} ${response.submitTime}`);
   if(studentIndex>=0){
         dataList.push({
studentName:dataFound.orgStudent[studentIndex].studentName,
studentRollNo:dataFound.orgStudent[studentIndex].studentRollNo,
studentId:response.studentId,
responseActive: response.active,
teacherRemark: response.teacherRemark,
studentDescription: response.studentDescription,
studentFile: response.studentFile,
submitDate : response.submitDate,
submitTime:response.submitTime
         });
   }
});
// console.log(dataList);
res.send({
 list: dataList,
 message:"list_found"
});
        }
        else{
          console.log("invalid assignment Id");
          res.send({
            message:"invalid_assignmentId"
          });
        }
      }
     else if(role==="Student"){
      
      var assignmentIndex = _.findIndex(dataFound.assignment,{
        id:assignmentId
      });
      if(assignmentIndex>=0){

        
   var studentIndex = _.findIndex(dataFound.orgStudent,{
     id:studentId
   });
   var studentPresentInAssignment = _.findIndex(dataFound.assignment[assignmentIndex].selectedStudents,{
      studentId: studentId
   });
   var remark;
   console.log(dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].teacherRemark);
             if(typeof(dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].teacherRemark)==="undefined"){
             remark = "";
           }
           else {
             remark =dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].teacherRemark
           }
   if(studentIndex>=0 && studentPresentInAssignment>=0){
         res.send({
           message:"list_found",
           data:{
            teacherRemark: remark,
            responseActive: dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active,
            studentDescription: dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentDescription,
            studentFile: dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentFile,
            submitDate : dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitDate,
            submitTime:dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitTime
           }

         });
   }
   else {
    console.log("invalid student Id");
    res.send({
      message:"invalid_studentId"
    });
   }
      }
      else  {
        console.log("invalid assignment Id");
        res.send({
          message:"invalid_assignmentId"
        });
      }
     } 
    }
    else{
console.log("invalid_orgCode");
res.send({
  message:"invalid_orgCode"
});
    }
  }).catch(err=>console.log(err));
};


//@ student submit answer
exports.submitAnswer = (req, res, next) => {
  var {orgCode,assignmentId,studentId,studentDescription,submitDate,submitTime} = req.body;

  organisation.findOne({
    orgCode 
  }).then(dataFound =>{
    if(dataFound){
      var assignmentIndex = _.findIndex(dataFound.assignment,{
        id:assignmentId
      });
      if(assignmentIndex>=0){
        console.log("valid assignment");
        var studentIndex = _.findIndex(dataFound.orgStudent,{
          id:studentId
         });
         var studentPresentInAssignment = _.findIndex(dataFound.assignment[assignmentIndex].selectedStudents,{
           studentId: studentId
         });
 
         var responseStatus = dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active;
console.log(responseStatus);
         if(studentIndex>=0 && studentPresentInAssignment>=0  && dataFound.orgStudent[studentIndex].active && responseStatus==0){

  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitDate= submitDate;
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitTime= submitTime;
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentFile= req.file.location;
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentDescription= studentDescription;
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active = 1;
console.log("changes done");
console.log(dataFound.assignment[assignmentIndex]);
dataFound.save().then(responseSaved =>{
console.log("student_assignment_save");
res.send({
  message:"assignment_response_saved"
})
}).catch(err=>{
  console.log("delete not allowed");
  res.send({
    message:"submit_response_not_allowed"
  });
})
}
else {
  console.log("delete not allowed");
  res.send({
    message:"submit_response_not_allowed"
  });
  
}

    }
    else  {
      console.log("invalid assignment Id");
      res.send({
        message:"submit_response_not_allowed"
      });
    }
    }
      else{
        console.log("invalid_orgCode");
        res.send({
          message:"submit_response_not_allowed"
        });
            }
          }).catch(err=>console.log(err));
};

//@ teacher give remark to student
exports.giveRemark = (req, res, next) => {
 var {orgCode,teacherCode,assignmentId,studentId,teacherRemark} = req.body;
 
 organisation.findOne({
   orgCode 
 }).then(dataFound =>{
   if(dataFound){
     var assignmentIndex = _.findIndex(dataFound.assignment,{
       id:assignmentId
     });
     if(assignmentIndex>=0){
       var studentIndex = _.findIndex(dataFound.orgStudent,{
         id:studentId
        });
        var studentPresentInAssignment = _.findIndex(dataFound.assignment[assignmentIndex].selectedStudents,{
          studentId: studentId
        });

        var responseStatus = dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active;
if(studentIndex>=0 && studentPresentInAssignment>=0 && responseStatus){

 dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].teacherRemark= teacherRemark;

dataFound.save().then(responseSaved =>{
console.log("remark given");
res.send({
 message:"remark_saved"
})
}).catch(err=>{
  console.log("delete not allowed");
 res.send({
   message:"remark_not_allowed"
 });
})
}
else {
 console.log("delete not allowed");
 res.send({
   message:"remark_not_allowed"
 });
 
}
   }
   else  {
     console.log("invalid assignment Id");
     res.send({
       message:"remark_not_allowed"
     });
   }
   }
     else{
       console.log("invalid_orgCode");
       res.send({
         message:"remark_not_allowed"
       });
           }
         }).catch(err=>console.log(err));

};



exports.deleteAnswer = (req, res, next) => {
  var {orgCode,studentId,assignmentId} = req.body;


  organisation.findOne({
    orgCode 
  }).then(dataFound =>{
    if(dataFound){
      var assignmentIndex = _.findIndex(dataFound.assignment,{
        id:assignmentId
      });
      if(assignmentIndex>=0){
        var studentIndex = _.findIndex(dataFound.orgStudent,{
          id:studentId
         });
         var studentPresentInAssignment = _.findIndex(dataFound.assignment[assignmentIndex].selectedStudents,{
           studentId: studentId
         });
 
         var responseStatus = dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active;
if(studentIndex>=0 && studentPresentInAssignment>=0  && dataFound.orgStudent[studentIndex].active && responseStatus){
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].teacherRemark = "";
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitDate= "";
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].submitTime= "";
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentFile= "";
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].studentDescription= "";
  dataFound.assignment[assignmentIndex].selectedStudents[studentPresentInAssignment].active = 0;

dataFound.save().then(responseSaved =>{
console.log("student_assignment_delete");
res.send({
  message:"assignment_response_deleted"
})
}).catch(err=>{
  console.log("delete not allowed");
  res.send({
    message:"delete_response_not_allowed"
  });
})
}
else {
  console.log("delete not allowed");
  res.send({
    message:"delete_response_not_allowed"
  });
  
}

    }
    else  {
      console.log("invalid assignment Id");
      res.send({
        message:"delete_response_not_allowed"
      });
    }
    }
      else{
        console.log("invalid_orgCode");
        res.send({
          message:"delete_response_not_allowed"
        });
            }
          }).catch(err=>console.log(err));
};
