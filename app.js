const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
var cors = require("cors");
var path = require("path");
var multer = require("multer");
var forms = multer();
const cron = require("node-cron");

//cron schdule task
const mailer = require("./utility/mailer");
const organisation = require("./models/organisation");

//@cron task
cron.schedule("2 * * * * *", () => {
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
  if(scheduleList.teacherCode === "Organisation"){
if(scheduleList.studentCount){

}
else{
  
}
  }
  else{

  }
}
});
});
}
else{
  console.log("data not found");
}
     }).catch(err=>console.log(err));     
//mail
// console.log("in");
// var details = {
//   scheduleSubject: "Testing",
//   scheduleDate: "aaj ka din",
//   scheduleTime: "subah subah",
//   orgName: "to chaliye shuru krte hain",
//   purpose: "scheduler bhai ki testing",
//   footerMessage:
//     "aa jaiyegga",
// };
// var mailList = ["abhishekedu4979@gmail.com","aashigupta165@gmail.com"];

// var subjectMail="Launch ki tayari";
// mailer.scheduleMail(mailList, details, subjectMail);
// console.log("out");
});


//@ routes

const register = require("./routes/register");
const login = require("./routes/login");
const showList = require("./routes/showList");
const schedule = require("./routes/schedule");
const question = require("./routes/question");
const passwordChange = require("./routes/passwordChange");
const version = require("./routes/version");

const app = express();

//@ mongodb connection
const db = require("./config/mongoDb").mongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Mongodb Connected"))
  .catch(err => console.log(err));
mongoose.Promise = global.Promise;


// app.use(forms.array());

app.use(bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
 

app.use("/api/app", register);
app.use("/api/app", login);
app.use("/api/app", showList);
app.use("/api/app", schedule);
app.use("/api/app", question);
app.use("/api/app", passwordChange);
app.use("/api/app",version);

app.use((err, req, res, next) => {
  res.status(422).send({
    error: err.field
  });
});

//listen for request
app.listen(process.env.PORT || 4240, () => {
  console.log("now listening for request");
});