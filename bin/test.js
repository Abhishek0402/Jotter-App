console.log("testing");

// const cron = require("node-cron");

// //cron schdule task
// const mailer = require("./utility/mailer");
// const organisation = require("./models/organisation");

// //@cron task
// cron.schedule("2 * * * * *", () => {
//      var today = new Date();
//           var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
//           var minutes= today.getMinutes();
//           var hour = today.getHours();
//           if(minutes<30){
//             minutes=minutes+30;
//           }
//           else{
//  hour =hour+1;
//  minutes =  minutes-30;
//           }
//           var time = hour + ":" + minutes;
//           console.log(date);
//           console.log(time);
//      organisation.find().then(data=>{
// if(data){
// var orgList = data.map((dataSet)=>{
// var scheduleSet = dataSet.schedules.map(scheduleList =>{
// if(scheduleList.scheduleDate== date && scheduleList.scheduleTime == time){
//   if(scheduleList.teacherCode === "Organisation"){
// if(scheduleList.studentCount){

// }
// else{
  
// }
//   }
//   else{

//   }
// }
// });
// });
// }
// else{
//   console.log("data not found");
// }
//      }).catch(err=>console.log(err));     
// //mail
// // console.log("in");
// // var details = {
// //   scheduleSubject: "Testing",
// //   scheduleDate: "aaj ka din",
// //   scheduleTime: "subah subah",
// //   orgName: "to chaliye shuru krte hain",
// //   purpose: "scheduler bhai ki testing",
// //   footerMessage:
// //     "aa jaiyegga",
// // };
// // var mailList = ["abhishekedu4979@gmail.com","aashigupta165@gmail.com"];

// // var subjectMail="Launch ki tayari";
// // mailer.scheduleMail(mailList, details, subjectMail);
// // console.log("out");
// });