const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
var moment = require("moment");
const authController = require("../Controller/authController");
const mailer = require("../utility/mailer");

router.post("/question/ask",authController.authenticate,(req,res,next)=>{

    var {orgCode} = req.body;
  organisation.findOne({
      orgCode
  }).then(orgFound =>{
if(orgFound){
var {purposeOfQuestion,question,
  questionAskerName,questionAskerCode,
  questionAskerRole,questionForClass,questionForSection}= req.body;

questionDateTime = moment().format();

if(questionAskerRole=="Teacher"){
 if(purposeOfQuestion=="Subject"){
 var {subject} = req.body;
 orgFound.questionaire.push({
   purposeOfQuestion:purposeOfQuestion,
   subject: subject,
   question: question,
   questionDateTime,
   questionAskerName,
   questionAskerRole,
   questionAskerCode,
   questionForClass,
   questionForSection
 });
 }
 else if(purposeOfQuestion=="Other"){
  orgFound.questionaire.push({
    purposeOfQuestion:purposeOfQuestion,
    question: question,
    questionDateTime,
    questionAskerName,
    questionAskerRole,
    questionAskerCode,
    questionForClass,
    questionForSection
  });
 }
 
}
else if(questionAskerRole=="Student"){
  if(purposeOfQuestion=="Subject"){
    var {subject} = req.body;
    orgFound.questionaire.push({
      purposeOfQuestion:purposeOfQuestion,
      subject: subject,
      question: question,
      questionDateTime,
      questionAskerName,
      questionAskerRole,
      questionAskerCode,
      questionForClass,
      questionForSection
    });
    }
    else if(purposeOfQuestion=="Other"){
      orgFound.questionaire.push({
        purposeOfQuestion:purposeOfQuestion,
        question: question,
        questionDateTime,
        questionAskerName,
        questionAskerRole,
        questionAskerCode,
        questionForClass,
        questionForSection
      });
    }  
  }

orgFound.save().then(questionSaved=>{
console.log("question asked");
res.send({
  message:"question_asked"
});
}).catch(err=>{console.log(err.message);
  res.send({
    message:"saving_error"
  })
});

}
else{
    console.log("invalid_OrgCode");
    res.send({
        message:"invalid_orgCode"
    });
}
  }).catch(err=>console.log(err.message));

});

router.post("/question/reply/create",authController.authenticate,(req,res,next)=>{
  var {orgCode} = req.body;
organisation.findOne({orgCode}).then(orgFound=>{
if(orgFound){
  var {questionId,reply,replierName,replierRole,
    replierCode} = req.body;
  var replyDateTime = moment().format();
  var questionIndex= _.findIndex(orgFound.questionaire,{
    id:questionId
  });
  if(questionIndex>=0){
    if(replierRole=="Teacher"){
     orgFound.questionaire[questionIndex].replies.push({
reply,
replyDateTime,
replierName,
replierRole,
replierCode
     });
    }
    else if(replierRole=="Student"){
      var {replierClass,replierSection} = req.body;
      orgFound.questionaire[questionIndex].replies.push({
        reply,
        replyDateTime,
        replierName,
        replierRole,
        replierCode,
        replierClass,
        replierSection
             });
    }
   orgFound.save().then(replySaved=>{
     console.log("reply saved");
     res.send({
       message:"replied"
     });
   }).catch(err=>{ console.log(err.message);
  res.send({
    message:"reply_not_allowed"
  });
  });
    
  }
  else{
    console.log("question not found");
    res.send({
      message:"reply_not_allowed"
    });
  }
}
else{
  console.log("invalid_OrgCode");
  res.send({
      message:"invalid_orgCode"
  });
}
}).catch(err=>console.log(err.message));
});



module.exports = router;
