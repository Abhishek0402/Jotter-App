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
// return {
//     email: studentEmail.studentEmail
// }
});
mailer.mail(mailList);
console.log(mailList);
// orgFound.save().then(scheduleCreate=>{
//     console.log("schedule created");
//     res.send({
//         message: "class_scheduled"
//     });
// }).catch(err=>{
//     console.log(err.message);
//     res.send({
//         message:"class_not_scheduled"
//     });
// })
    }
    else{
console.log("org not found");
res.send({
    message:"invalid_orgCode"
});
    }
}).catch(err=>console.log(err.message));

});


module.exports = router;