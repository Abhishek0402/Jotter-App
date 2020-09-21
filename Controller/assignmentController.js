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

  mailer.scheduleMail(mailList, details, subjectMail);
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
              assList.push({
                assignmentId: assignmentList.id,
                assignmentTitle:assignmentList.assignmentTitle,
                subjectAssignment:assignmentList.subjectAssignment,
                assignmentDate: assignmentList.assignmentDate,
                assignmentTime:assignmentList.assignmentTime,
                description:assignmentList.description,
                file: assignmentList.file,
                submitCount: c,
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
          mailer.scheduleMail(mailList, details, subjectMail);
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
   if(studentIndex>=0){
         dataList.push({
studentName:dataFound.orgStudent[studentIndex].studentName,
studentRollNo:dataFound.orgStudent[studentIndex].studentRollNo,
studentId:response.studentId,
teacherRemark: response.teacherRemark,
active: response.active,
studentDescription: response.studentDescription,
studentFile: response.studentFile,
submitDate : response.submitDate,
submitTime:response.submitTime
         });
   }
});
console.log(dataList);
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
   var studentPresentInAssignment = _.findIndex(dataFound.assignment[assignmentIndex].selectedStudent,{
      studentId: studentId
   });
   if(studentIndex>=0 && studentPresentInAssignment){
         res.send({
           message:"list_found",
           data:{
            studentName:dataFound.orgStudent[studentIndex].studentName,
            studentRollNo:dataFound.orgStudent[studentIndex].studentRollNo,
            studentId: studentId,
            teacherRemark: dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].teacherRemark,
            active: dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].active,
            studentDescription: dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].studentDescription,
            studentFile: dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].studentFile,
            submitDate : dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].submitDate,
            submitTime:dataFound.assignment[assignmentIndex].selectedStudent[studentPresentInAssignment].submitTime
           }

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

exports.giveRemark = (req, res, next) => {
  console.log(req.body);
};

exports.submitAnswer = (req, res, next) => {
  console.log(req.body);
};

exports.deleteAnswer = (req, res, next) => {
  console.log(req.body);
};
