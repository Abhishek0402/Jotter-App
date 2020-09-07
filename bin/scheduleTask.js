const mailer = require("../utility/mailer");
const organisation = require("../models/organisation");

var notificationKey = require("../config/notification");

var sender = new gcm.Sender(notificationKey.serverKey);

//@cron task
     var today = new Date();
     var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          var minutes= today.getMinutes();
          var hour = today.getHours();
          if(minutes<30){
            minutes=minutes+30;
          }
          else{
 hour =hour+1;
 minutes =  minutes-30;
          }
          var time = hour + ":" + minutes;
          console.log(date);
          console.log(time);
     organisation.find().then(data=>{
if(data){
var orgList = data.map((dataSet)=>{
var scheduleSet = dataSet.schedules.map(scheduleList =>{
if(scheduleList.scheduleDate== date && scheduleList.scheduleTime == time){

    //details
    var subjectForMail;
    if (scheduleList.topicScheduled === "Subject") {
      subjectForMail = subjectScheduled;
    } else {
      subjectForMail = "General Talk";
    }
    var orgLogo = dataSet.orgLogo;
    var details = {
        scheduleSubject: subjectForMail,
        scheduleDate: scheduleList.scheduleDate,
        scheduleTime: scheduleList.scheduleTime,
        orgName: dataSet.orgName,
        purpose: "Reminder for the below schedule:",
        orgLogo: orgLogo,
        footerMessage:
          "Please, don't forget to join the above schedule on time.",
      };

      var subjectMail = "Schedule Reminder";

      var mailList = new Array();
var registrationTokens = new Array();

  if(scheduleList.teacherCode === "Organisation"){
      
details.scheduleSubject = scheduleList.description;
registrationTokens.push(dataSet.deviceToken);
mailList.push(dataSet.orgEmail);

details.teacherName = dataSet.orgName;
var messageBody = `You have a schedule for ${details.scheduleSubject} at ${details.scheduleTime} on ${details.scheduleDate} by ${details.teacherName}.`;

if(scheduleList.studentCount=="1"){
//all students selected

var std = dataSet.orgStudent.map(student =>{
  if(student.active){
    registrationTokens.push(student.deviceToken);
    mailList.push(student.studentEmail);
  }
  });
}
else{
  //some students selected
  var std = scheduleList.selectedStudents.map(stList=>{
    var studentIndex = _.findIndex(dataSet.orgStudent, {
        studentEmail:stList.studentEmail
      });
      if(studentIndex>=0){
        email =  dataSet.orgStudent[studentIndex].email;
        deviceToken = dataSet.orgStudent[studentIndex].deviceToken;
        mailList.push(email);
        registrationTokens.push(deviceToken);
      }
    
  });
}
  }
  else{
//for teacher
var teacherIndex = _.findIndex(dataSet.orgTeachers,{
    teacherCode: scheduleList.teacherCode
});
if(teacherIndex>=0){
    registrationTokens.push(dataSet.orgTeachers[teacherIndex].deviceToken);
    mailList.push(dataSet.orgTeachers[teacherIndex].teacherEmail);
details.teacherName = dataSet.orgTeachers[teacherIndex].teacherName;
}
var messageBody = `You have a schedule for ${details.scheduleSubject} at ${details.scheduleTime} on ${details.scheduleDate} by ${details.teacherName}.`;
var std = scheduleList.selectedStudents.map(stList=>{
    var studentIndex = _.findIndex(dataSet.orgStudent, {
        studentEmail:stList.studentEmail
      });
      if(studentIndex>=0){
        email =  dataSet.orgStudent[studentIndex].email;
        deviceToken = dataSet.orgStudent[studentIndex].deviceToken;
        mailList.push(email);
        registrationTokens.push(deviceToken);
      }
    
  });
  }
}
});
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
      title: "Schedule Reminder",
      body: messageBody,
      icon: "ic_launcher",
    },
    notification: {
      title: "Schedule Reminder",
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
      } else {
        console.log(response);
  console.log("mailSent");
      }
    }
  );

}
     }).catch(err=>console.log(err));     

     // mail
// console.log("in");

// var mailList = ["abhishekedu4979@gmail.com","aashigupta165@gmail.com"];

// var subjectMail="Launch ki tayari";
// mailer.scheduleMail(mailList, details, subjectMail);
// console.log("out");
