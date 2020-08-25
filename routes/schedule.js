const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
var moment = require("moment");
const authController = require("../Controller/authController");
const mailer = require("../utility/mailer");
var gcm = require('node-gcm');


router.post("/schedule/create",authController.authenticate,(req,res,next)=>{
var {orgCode,teacherCode,classScheduled,sectionScheduled,topicScheduled,subjectScheduled,scheduleDate,scheduleTime,selectedStudents}=req.body;
var studentSplitter = _.split(selectedStudents,",");
console.log(req.body);
var studentsList = new Array();
var mailList = new Array();
console.log(studentSplitter);

for (var selectedStudentDetails in studentSplitter) {
                var studentNewData = _.split(studentSplitter[selectedStudentDetails], "_");
                console.log(studentNewData);
                var studentName = studentNewData[0];
                var studentRollNo = studentNewData[1];
var studentEmail = studentNewData[2];
                mailList.push(studentEmail);
// console.log(studentName);
                studentsList.push({
                studentRollNo: studentRollNo,
          studentEmail: studentEmail,
           studentName:studentName
                });
              }

console.log(studentsList);
var createdAt= moment().format();
var updatedAt= moment().format();
organisation.findOne({
    orgCode
}).then(orgFound =>{
    console.log("orgFound");
    if(orgFound) {
orgFound.schedules.push({
    teacherCode,classScheduled,sectionScheduled,topicScheduled,subjectScheduled,createdAt,updatedAt,scheduleDate,scheduleTime,selectedStudents: studentsList
});
var teacherIndex = _.findIndex(orgFound.orgTeachers,{
    teacherCode:teacherCode
});
var teacherName = orgFound.orgTeachers[teacherIndex].teacherName;
var subjectForMail;
if(topicScheduled==="Subject") {
 subjectForMail=subjectScheduled;
}
else {
subjectForMail="General Talk";
}
var orgLogo = orgFound.orgLogo;
var details = {
    scheduleSubject: subjectForMail,
    teacherName: teacherName,
    scheduleDate:scheduleDate,
    scheduleTime:scheduleTime,
    orgName:orgFound.orgName,
    purpose:"You have a new schedule as below :",
    orgLogo:orgLogo
}

var subjectMail = "Schedule";

mailer.scheduleMail(mailList,details,subjectMail);

//notification
var sender = new gcm.Sender("AAAAuwomdSw:APA91bHggMBtVnwYr9oAOR8b9GKBZnPLmdJtt45FPi_sbXrnqqUTyCPxUHzKYgKege71ItHLWHspOlswjQtFdLB6nyfwAixKjZ4t9trWvAtxgraO7Gxnu3WseVe0Mua4j4JMGv4PfgZY");

console.log(sender);

var message = new gcm.Message({
    // collapseKey: 'demo',
    priority: 'high',
    contentAvailable: true,
    delayWhileIdle: true,
    timeToLive: 60,
    // restrictedPackageName: "somePackageName",
    dryRun: false,
    data: {
        key1: 'message1'
        // key2: 'message2'
    },
    notification: {
        title: "New Schedule",
        icon: "ic_launcher",
        body: `You have a new schedule for ${details.scheduleSubject} at ${details.scheduleTime} on ${details.scheduleDate} by ${details.teacherName}.`
    }
});

// message.addData('key1','message1');
// message.addData('key2','message2');

console.log(message);

var registrationTokens = new Array();
registrationTokens.push('fhHQcz8nR4SQ5X-gtZUL71:APA91bE1y-0Ean6QfY3LMSmaT1tihT2Hq_kSs791LePVy4qn2v1P5334dqKHDA8FthuNcNgAQLKwwJ1df75bDk9GdoJ8696ailU2hsJ9qdfNlQQqBJMJ8tP8g8nd1qzJgL_1Jvpk47ey');

// var tokenList = orgFound.orgStudent.map(studentToken=>{

// });

console.log(registrationTokens);

sender.sendNoRetry(message, {registrationTokens: registrationTokens}, function(err, response) {
    if(err) {
        console.error(err);
        res.send({
            message:"class_not_scheduled"
        });
    }
    else {

        console.log(response);

console.log(mailList);
orgFound.save().then(scheduleCreate=>{
    console.log("schedule created");
    res.send({
        response: response,
        message: "class_scheduled"
    });
}).catch(err=>{
    console.log(err.message);
    res.send({
        message:"class_not_scheduled"
    });
});

}  
  });



console.log("notification ends");

  //notification end

}
    else{
console.log("org not found");
res.send({
    message:"invalid_orgCode"
});
    }
}).catch(err=>console.log(err.message));

});


router.post("/schedule/read",authController.authenticate,(req,res,next)=>{

const {role,orgCode}= req.body;

organisation.findOne({
    orgCode
}).then(orgFound=>{
if(orgFound){
if(role== "Teacher"|| role=="teacher"){
    const {teacherCode} = req.body;
console.log(orgFound.schedules);

var scList = new Array();
var teacherScheduleList = orgFound.schedules.map((scheduleList)=>{
  if(scheduleList.teacherCode==teacherCode && scheduleList.active){
scList.push({
scheduleId: scheduleList._id,
scheduledClass: scheduleList.classScheduled,
scheduledSection:scheduleList.sectionScheduled,
topicScheduled:scheduleList.topicScheduled,
subjectScheduled:scheduleList.subjectScheduled,
    scheduleDate:scheduleList.scheduleDate,
    scheduleTime: scheduleList.scheduleTime,
    studentCount: scheduleList.selectedStudents.length
});
  }
});

console.log(scList);
res.send({
    list: scList,
    message:"list_found"
});
}
else if(role=="Student"|| role=="student"){
const {studentClass,studentSection,studentRollNo} = req.body;
var scList = new Array();
var studentScheduleList = orgFound.schedules.map((scheduleList)=>{
  if(scheduleList.classScheduled==studentClass && scheduleList.sectionScheduled == studentSection &&scheduleList.active){
      var roleCheck = _.findIndex(scheduleList.selectedStudents,{
          studentRollNo:studentRollNo
      });
      if(roleCheck>=0){
          var teacherIndex = _.findIndex(orgFound.orgTeachers,{
            teacherCode:scheduleList.teacherCode 
          });
          var teacherName = orgFound.orgTeachers[teacherIndex].teacherName;
scList.push({
topicScheduled:scheduleList.topicScheduled,
subjectScheduled:scheduleList.subjectScheduled,
    scheduleDate:scheduleList.scheduleDate,
    scheduleTime: scheduleList.scheduleTime,
    studentCount: scheduleList.selectedStudents.length,
    teacherName:teacherName
});
      }

  }
});

console.log(scList);
res.send({
    list: scList,
    message:"list_found"
});
}
}
else{
   console.log("org not found");
res.send({
    message:"invalid_orgCode"
}); 
}
}).catch(err=>console.log(err.message));

});




router.post("/schedule/update",authController.authenticate,(req,res,next)=>{
 var {orgCode,scheduleId,newScheduleDate,newScheduleTime,teacherCode} = req.body;
 var updatedAt = moment().format();
console.log(scheduleId);
 organisation.findOne({
     orgCode
 }).then(orgFound=>{
     if(orgFound){
var scheduleIndex = _.findIndex(orgFound.schedules,{
    id:scheduleId
});
console.log(scheduleIndex);
// console.log(typeOf(scheduleIndex));
if(orgFound.schedules[scheduleIndex].active && orgFound.schedules[scheduleIndex].teacherCode == teacherCode){
    orgFound.schedules[scheduleIndex].scheduleDate = newScheduleDate;
orgFound.schedules[scheduleIndex].scheduleTime = newScheduleTime;
orgFound.schedules[scheduleIndex].updatedAt = updatedAt;

console.log(orgFound.schedules[scheduleIndex]);


//mailer
// var mailList = new Array();
// var studentEmailList = selectedStudents.map((studentEmail)=>{
//     mailList.push(studentEmail.studentEmail);
// return {
//     email: studentEmail.studentEmail
// };
// });
// var details = {
//     scheduleSubject: subjectForMail,
//     teacherName: teacherName,
//     scheduleDate:scheduleDate,
//     scheduleTime:scheduleTime,
//     orgName:orgFound.orgName,
//     purpose:"You have a new schedule as below :",
//     orgLogo:orgLogo
// }
// var subjectMail = "Schedule"
// mailer.scheduleMail(mailList,details,subjectMail);


orgFound.save().then(data=>{
    console.log("updated");
res.send({
    message:"schedule_updated"
});
    
}).catch(err=>console.log(err.message));
}
else {
    console.log("inactive_schedule or wrong_teacherCode");
    res.send({
        message:"update_not_allowed"
    });
}
     }
     else{
   console.log("org not found");
 res.send({
        message:"update_not_allowed"
    });
     }
 }).catch(err=>console.log(err.message));

});





router.post("/schedule/delete",authController.authenticate,(req,res,next)=>{

 var {orgCode,scheduleId,teacherCode} = req.body;
 var updatedAt = moment().format();
console.log(scheduleId);
 organisation.findOne({
     orgCode
 }).then(orgFound=>{
     if(orgFound){
var scheduleIndex = _.findIndex(orgFound.schedules,{
    id:scheduleId
});
console.log(scheduleIndex);
// console.log(typeOf(scheduleIndex));
if(orgFound.schedules[scheduleIndex].active && orgFound.schedules[scheduleIndex].teacherCode == teacherCode){
 orgFound.schedules[scheduleIndex].active= !orgFound.schedules[scheduleIndex].active;
orgFound.schedules[scheduleIndex].updatedAt = updatedAt;

console.log(orgFound.schedules[scheduleIndex]);

//mailer
// var mailList = new Array();
// var studentEmailList = selectedStudents.map((studentEmail)=>{
//     mailList.push(studentEmail.studentEmail);
// return {
//     email: studentEmail.studentEmail
// };
// });

orgFound.save().then(data=>{
    console.log("deleted");
res.send({
    message:"schedule_deleted"
});
    
}).catch(err=>console.log(err.message));
}
else {
    console.log("inactive_schedule or wrong_teacherCode");
    res.send({
        message:"delete_not_allowed"
    });
}
     }
     else{
   console.log("org not found");
 res.send({
        message:"delete_not_allowed"
    });
     }
 }).catch(err=>console.log(err.message));

});
module.exports = router;