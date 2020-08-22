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
  questionAskerRole,questionForClass,questionForSection,questionDateTime}= req.body;



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
    replierCode,replyDateTime} = req.body;
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


router.post("/question/read",authController.authenticate,(req,res,next) =>{
const {orgCode} = req.body;
organisation.findOne({
  orgCode
}).then(orgFound=>{
if(orgFound){
var questionActiveList = new Array();
  const questionList = orgFound.questionaire.map(questionSingle=>{
 if(questionSingle.active){
questionActiveList.push({
  questionId:questionSingle.id,
purposeOfQuestion:questionSingle.purposeOfQuestion,
subject:questionSingle.subject,
question:questionSingle.question,
questionAskerName:questionSingle.questionAskerName,
questionAskerRole:questionSingle.questionAskerRole,
questionAskerCode:questionSingle.questionAskerCode,
questionForClass:questionSingle.questionForClass,
questionForSection:questionSingle.questionForSection,
   questionDateTime:questionSingle.questionDateTime
});
 }
  });
    console.log(questionActiveList);
    res.send({
      list: questionActiveList,
      message:"list_found"
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

router.post("/question/reply/read",authController.authenticate,(req,res,next)=>{
const {orgCode,questionId}= req.body;

organisation.findOne({
  orgCode
}).then(orgFound=>{
if(orgFound){
  var questionIndex = _.findIndex(orgFound.questionaire,{
    id:questionId
  });

  if(questionIndex>=0 && orgFound.questionaire[questionIndex].active){
    var replyActiveList = new Array();
    const questionList = orgFound.questionaire[questionIndex].replies.map(questionReplySingle=>{
  if(questionReplySingle.active){
    replyActiveList.push({
      replyId:questionReplySingle.id,
      replyDateTime:questionReplySingle.replyDateTime,
      replierName:questionReplySingle.replierName,
      replierRole: questionReplySingle.replierRole,
      replierCode:questionReplySingle.replierCode,
      replierClass:questionReplySingle.replierClass,
      replierSection:questionReplySingle.replierSection,
    });
  }  
    });
      console.log(replyActiveList);
      res.send({
        list: replyActiveList,
        message:"list_found"
      });
  }
  else{
    console.log("invalid question id");
    res.send({
      message:"invalid_question_id"
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


router.post("/question/delete",authController.authenticate,(req,res,next)=>{
var {orgCode,questionId} = req.body;
organisation.findOne({orgCode}).then(orgFound=>{
if(orgFound){
 var questionIndex = _.findIndex(orgFound.questionaire,{
   id:questionId
 });
 
 if(questionIndex>=0 && orgFound.questionaire[questionIndex].active){
  orgFound.questionaire[questionIndex].active = !orgFound.questionaire[questionIndex].active;
  orgFound.save().then(questionDeleted=>{
console.log("deleted");
res.send({
  message:"question_deleted"
});
  }).catch(err=>{
    console.log(err.message);
    res.send({
      message:"delete_not_allowed"
    });
  })
 }
 else{
   console.log("inactive question");
   res.send({
     message:"delete_not_allowed"
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


router.post("/question/reply/delete",authController.authenticate,(req,res,next)=>{
 var {orgCode,questionId,replyId} = req.body;
 organisation.findOne({orgCode}).then(orgFound=>{
if(orgFound){
  var questionIndex = _.findIndex(orgFound.questionaire,{
    id:questionId
  });
  
  if(questionIndex>=0 && orgFound.questionaire[questionIndex].active){
    var replyIndex = _.findIndex(orgFound.questionaire[questionIndex].replies,{
      id:replyId
    });
    if(replyIndex>=0 && orgFound.questionaire[questionIndex].replies[replyIndex].active){
      orgFound.questionaire[questionIndex].replies[replyIndex].active = !orgFound.questionaire[questionIndex].replies[replyIndex].active;
      orgFound.save().then(replyDeleted=>{
    console.log("deleted");
    res.send({
      message:"reply_deleted"
    });
      }).catch(err=>{
        console.log(err.message);
        res.send({
          message:"delete_not_allowed"
        });
      })
    }
    else{
      console.log("inactive question");
    res.send({
      message:"delete_not_allowed"
    });
    }
 
  }
  else{
    console.log("inactive question");
    res.send({
      message:"delete_not_allowed"
    });
  }
}
else{
  console.log("org not found");
  res.send({
    message:"invalid_orgCode"
  });
}
 }).catch(err=>{
   console.log(err.message)
})
});

module.exports = router;
