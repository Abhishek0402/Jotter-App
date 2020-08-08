const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
const registerController = require("../Controller/registercontroller");
var fs = require('fs');
var csv = require('fast-csv');

// const singleUpload = registerController.uploadCsv.single('file');

router.post("/register",registerController.uploadCsv.single('file'),(req,res,next)=>{
const {role,mobile,methodToCreate} = req.body;
console.log("avd");
userData.findOne({
mobile
}).then(async(userExists) =>{
 if(userExists){
     console.log(userExists);
     console.log("ReadFormData");
     if(role == "Class" && methodToCreate =="Manual") {
         
const {orgCode,orgClasses} = req.body;
organisation.findOne({orgCode}).then(orgExists =>{
if(orgExists){
const {class_section_subject}= req.body;
var classes = new Array();

// console.log(class_section_subject);

var classSeperator= _.split(class_section_subject,',');
// console.log(classSeperator);
for(var classFinder in classSeperator){
// console.log(classSeperator[classFinder]);
var classNewFind = _.split(classSeperator[classFinder],'_');
var classNewFindLength = classNewFind.length;
var orgClass = classNewFind[0];
var orgSection = classNewFind[1];
classNewFind = _.reverse(classNewFind);
var Subject = new Array();

for(var i=0;i<classNewFindLength-2;i++){
    Subject.push({subjects: classNewFind[i]});
}
console.log(Subject);
orgExists.orgClasses.push({
    orgClass: orgClass,
    orgSection: orgSection,
    orgSubjects: Subject
});

}
   
    // orgExists.orgClasses.push({
    //    orgClasses:classes
    // });
    // orgExists.orgClasses = classes;
       orgExists.save().then(ClassCreated =>{
           console.log(ClassCreated);
           res.send(ClassCreated);
       }).catch(err=> console.log(err.message));

}
else{
    console.log("Invalid orgCode");
    res.send({
        message: "Invalid_orgCode"
    });
}
}).catch(err=>console.log(err));
     }

 else if(role === "Class" && methodToCreate === "File"){
     const file = req.file;
const {orgCode} = req.body;
organisation.findOne({orgCode}).then(async orgExists =>{
    if(orgExists){

     await registerController.read(file.originalname).then(async data => {
        await registerController.csvParser(data.Body.toString()).then(async data => {
            console.log(data);
            req.addClass = await JSON.stringify(data, null, 2);
            var arr = JSON.parse(req.addClass);
            console.log(arr);
console.log(orgExists);
            const orgClasses = await arr.map((item) => {
                var teachSubject = _.split(item.subjects,",");
                var orgSubjects = new Array();
                for(var i in teachSubject){
orgSubjects.push({
    subjects: teachSubject[i]
});
                }
                console.log(orgSubjects);
orgExists.orgClasses.push({
orgClass:item.orgClass,
orgSection:item.orgSection,
orgSubjects: orgSubjects
     
})
    });
// console.log(orgClasses);
         }).catch(err => console.log(err));
    }).catch(err => console.log(err));

    //    console.log(orgExists);
    //   orgExists.orgClasses.push(orgClasses);
      console.log("new Line");
      console.log("new Line");
      console.log("new Line");
      console.log("new Line");
      console.log(orgExists);
      orgExists.save().then(classCreated => {
          console.log("classCreated");
          res.send(classCreated);
      }).catch(err=>console.log(err));
    }
    else{
        console.log("invalid org Code");
        res.send({
            "message":"invalid_org_code"
        });
    }
}).catch(err=>console.log(err));
     }

     else{
        console.log("existing user");
        res.send({
            message: "user_already_exist"
        });
     }
 }
 else{



if(role =="Admin" && methodToCreate=="Manual"){
  const {name,email,password,mobile} = req.body;
  const newAdmin = new admin({
      name,email,password,mobile,role
  });
  const newUserData = new userData({
      mobile,
      role
  })
  newUserData.save().then(userCreated => {
       console.log("user created"); 
       newAdmin.save().then(admin => {
        console.log("admin created"); 
 res.send(admin);
   }).catch(err=>console.log(err));
  }).catch(err=>console.log(err));
  
}



else if(role=="Organisation" && methodToCreate =="Manual"){

const {orgName,orgCode,orgType,orgAddress,orgLogo,orgEmail}= req.body;
orgPassword=orgName+"@123";
console.log(orgPassword);
const newOrg = new organisation({
orgName,orgCode,orgType,orgAddress,orgLogo,orgPassword,role,orgEmail,orgMobile:mobile
});
const newUserData = new userData({
mobile,role,organisation:orgName
});
newUserData.save().then(user=>{
    console.log("user created");
    newOrg.save().then(org =>{
        console.log(org);
        res.send(org);
    }).catch(err=> console.log(err));
}).catch(err=>console.log(err));
}



else if(role=="Teacher" && methodToCreate =="Manual"){
const {teacherName,teacherAge,teacherDesignation,teacherCode,teacherGender,
teacherEmail,class_section_subject,orgName} = req.body;
  teacherPassword = teacherName+"@123";
var classes = new Array();

// console.log(class_section_subject);

var classSeperator= _.split(class_section_subject,',');
// console.log(classSeperator);
for(var classFinder in classSeperator){
// console.log(classSeperator[classFinder]);
var classNewFind = _.split(classSeperator[classFinder],'_');
var classNewFindLength = classNewFind.length;
var teacherClass = classNewFind[0];
var teacherSection = classNewFind[1];
classNewFind = _.reverse(classNewFind);
var subjects = new Array();

for(var i=0;i<classNewFindLength-2;i++){
    subjects.push({subject: classNewFind[i]});
}
classes.push({
    teacherClass: teacherClass,
    teacherSection: teacherSection,
    teachingSubjects: subjects
});

}

// console.log(teachingClasses);

organisation.findOne({
    orgName
}).then((orgExists)=>{
    if(orgExists){
const newUserData = new userData({
mobile,role,organisation:orgName
});

orgExists.orgTeachers.push({
    teacherName,teacherAge,teacherDesignation,teacherCode,teacherGender,role,teacherEmail,teacherPassword,teacherMobile:mobile,
   teachingClasses:classes
});
// console.log(orgExists);
newUserData.save().then(user=>{
   console.log("user created");
   orgExists.save().then(teacher =>{
       console.log(teacher);
       res.send(teacher);
   }).catch(err=> console.log(err.message));
}).catch(err=>console.log(err));

    }
    else{
        console.log("create organisation first");
        res.send({
            message:"create organisation first"
        });
    }
}).catch(err=>console.log(err));

}








else if(role === "Teacher" && methodToCreate === "File"){
    const file = req.file;
const {orgCode} = req.body;

organisation.findOne({orgCode}).then(async orgExists =>{
    if(orgExists){
        await registerController.read(file.originalname).then(async data => {
            await registerController.csvParser(data.Body.toString()).then(async data => {
                // console.log(data);
                req.addClass = await JSON.stringify(data, null, 2);
                var arr = JSON.parse(req.addClass);
                // console.log(arr);


const orgTeachers = await arr.map((item) => {

             
    var classes = new Array();
    var classSeperator= _.split(item.class_section_subjects,',');
    var classLength = classSeperator.length;
    for(var classFinder in classSeperator){
    var classNewFind = _.split(classSeperator[classFinder],'_');
    var classNewFindLength = classNewFind.length;
    var teacherClass = classNewFind[0];
    var teacherSection = classNewFind[1];
    
    classNewFind = _.reverse(classNewFind);
    var subjects = new Array();
    
    for(var i=0;i<classNewFindLength-2;i++){
    subjects.push({subject :classNewFind[i]});
    }
classes.push({
    teacherClass: teacherClass,
    teacherSection: teacherSection,
    teachingSubjects: subjects
});
}

//classes has class section subjects;
    orgExists.orgTeachers.push({
        teacherName: item.name,
        teacherAge: item.age,
        teacherDesignation: item.designation,
        teacherCode: item.code,
        teacherGender: item.gender,
        role: role,
        teacherEmail: item.email,
teacherPassword:item.name+"@123",
teacherMobile:item.mobile,
teachingClasses: classes
       }); 
});

     console.log(orgExists);

             }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    
      orgExists.save().then(teacherCreated => {
          console.log("teacherCreated");
          res.send(teacherCreated);
      }).catch(err=>console.log(err));

    }
    else{
        console.log("invalid org Code");
        res.send({
            "message":"invalid_org_code"
        });
    }
 }).catch(err=>console.log(err));
   
}

else if(role=="Student" && methodToCreate =="Manual"){

    const {studentName,studentRollNo,studentClass,studentSection,
    studentFatherName,studentEmail,studentDOB,studentGender,orgName} = req.body;
 studentPassword = studentName+"@123";

 organisation.findOne({
     orgName
 }).then((orgExists)=>{
     if(orgExists){
const newUserData = new userData({
mobile,role,organisation:orgName
});

orgExists.orgStudent.push({
    studentName,studentRollNo,studentClass,studentSection,studentFatherName,
    role,studentEmail,studentMobile:mobile,studentDOB,studentGender,studentPassword
});
console.log(orgExists);
newUserData.save().then(user=>{
    console.log("user created");
    orgExists.save().then(student =>{
        console.log(student);
        res.send(student);
    }).catch(err=> console.log(err));
}).catch(err=>console.log(err));

     }
     else{
         console.log("create organisation first");
         res.send({
             message:"create organisation first"
         });
     }
 }).catch(err=>console.log(err));

}   

else if(role==="Student" && methodToCreate ==="File"){
    const file = req.file;
    const {orgCode} = req.body;
    organisation.findOne({orgCode}).then(async orgExists =>{
        if(orgExists){
    
         await registerController.read(file.originalname).then(async data => {
            await registerController.csvParser(data.Body.toString()).then(async data => {
                console.log(data);
                req.addClass = await JSON.stringify(data, null, 2);
                var arr = JSON.parse(req.addClass);
               
                const orgClasses = await arr.map((item) => {
    orgExists.orgStudent.push({
    studentName:item.name,
    studentRollNo: item.rollNo,
    studentClass:item.studentClass,
    studentSection:item.section,
    studentFatherName: item.fatherName,
role: item.role,
studentEmail:item.email,
studentMobile:item.mobile,
studentDOB: item.dob,
studentGender:item.gender,
studentPassword: item.name+"@AB12",

    });
        });
    // console.log(orgClasses);
             }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    
          orgExists.save().then(studentCreated => {
              console.log("studentCreated");
              res.send(studentCreated);
          }).catch(err=>console.log(err));
        }
        else{
            console.log("invalid org Code");
            res.send({
                "message":"invalid_org_code"
            });
        }
    }).catch(err=>console.log(err));
}

 }
}).catch(err => console.log(err));
});


module.exports = router;


 