const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
var moment = require("moment");
const authController = require("../Controller/authController");
const mailer = require("../utility/mailer");

router.post("/question/ask",(req,res,next)=>{

    var {orgCode} = req.body;
  organisation.findOne({
      orgCode
  }).then(orgFound =>{
if(orgFound){
var {purposeOfQuestion,question,
  questionAskerName,questionAskerCode,
  questionAskerRole,
  questionForClass,questionForSection}= req.body;

questionDateTime = moment().format();

if(questionAskerRole=="Teacher"){
 if(purposeOfQuestion=="Subject"){
 var {subject} = req.body;
 orgFound.questionaire.push({
   subject: subject
 });
 }
 orgFound.questionaire.push({
  purposeOfQuestion:purposeOfQuestion,
  question: question,
  questionDateTime,
  questionAskerName,
  questionAskerRole,
  questionAskerCode,
  QuestionForClass,
  questionForSection
});
}
else if(questionAskerRole=="Student"){
  var {questionAskerClass,questionAskerSection} = req.body;
  if(purposeOfQuestion=="Subject"){
    var {subject} = req.body;
    orgFound.questionaire.push({
      subject: subject
    });
    }
    orgFound.questionaire.push({
     purposeOfQuestion:purposeOfQuestion,
     question: question,
     questionDateTime,
     questionAskerName,
     questionAskerRole,
     questionAskerCode,
     questionAskerClass,
     questionAskerSection,
     QuestionForClass,
     questionForSection
   });
  
}

orgFound.save().then(questionSaved=>{
console.log("question asked");
res.send({
  message:"question_asked"
});
}).catch(err=>console.log(err.message));

}
else{
    console.log("invalid_OrgCode");
    res.send({
        message:"invalid_orgCode"
    });
}
  }).catch(err=>console.log(err.message));

});