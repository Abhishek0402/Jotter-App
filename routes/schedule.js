const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
var moment = require("moment");
const authController = require("../Controller/authController");
const mailer = require("../utility/mailer");

router.post("/schedule/create",authController.authenticate,(req,res,next)=>{
var {orgCode,teacherCode,classScheduled,sectionScheduled,topicScheduled,subjectScheduled,scheduleDate,scheduleTime,selectedStudents}=req.body;
console.log(req.body);
var createdAt= moment().format();
var updatedAt= moment().format();
console.log(`${createdAt} and ${updatedAt}`);
organisation.findOne({
    orgCode
}).then(orgFound =>{
    console.log("orgFound");
    if(orgFound){
orgFound.schedules.push({
    teacherCode,classScheduled,sectionScheduled,topicScheduled,subjectScheduled,createdAt,updatedAt,scheduleDate,scheduleTime,selectedStudents
});

var mailList = new Array();
var studentEmailList = selectedStudents.map((studentEmail)=>{
    mailList.push(studentEmail.studentEmail);
return {
    email: studentEmail.studentEmail
};
});

// mailer.mail(mailList);

console.log(mailList);
orgFound.save().then(scheduleCreate=>{
    console.log("schedule created");
    res.send({
        message: "class_scheduled"
    });
}).catch(err=>{
    console.log(err.message);
    res.send({
        message:"class_not_scheduled"
    });
})
    }
    else{
console.log("org not found");
res.send({
    message:"invalid_orgCode"
});
    }
}).catch(err=>console.log(err.message));

});


router.post("/schedule/read",(req,res,next)=>{

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
// scheduleId: scheduleList._id,
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
scList.push({
topicScheduled:scheduleList.topicScheduled,
subjectScheduled:scheduleList.subjectScheduled,
    scheduleDate:scheduleList.scheduleDate,
    scheduleTime: scheduleList.scheduleTime,
    studentCount: scheduleList.selectedStudents.length
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




router.post("/schedule/update",(req,res,next)=>{

});

router.post("/schedule/delete",(req,res,next)=>{

});
module.exports = router;