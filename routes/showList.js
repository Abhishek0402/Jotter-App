const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
const authController = require("../Controller/authController");

router.post("/showList",authController.authenticate,(req,res,next)=>{
var {currentRole,orgCode} = req.body;

userData.findOne({
    orgCode
}).then((orgExists)=>{
    if(orgExists){
if(currentRole ==="Admin"){
organisation.find().then((allOrgs)=>{
const orgs = allOrgs.map((org) =>{
    return{ 
        orgName:org.orgName,
    orgCode: org.orgCode
    }
});
res.send({
    list: orgs,
    message:"list_found"
});
console.log(orgs);
}).catch(err=>console.log(err));
} else if(currentRole === "Organisation"){

organisation.findOne({orgCode}).then(orgFound=>{
    if(orgFound){
        const teacherList = orgFound.orgTeachers.map((teachers) =>{
            return{ 
                teacherName:teachers.teacherName,
                teacherCode: teachers.teacherCode,
                active:teachers.active
            }
        });
        res.send({
            list: teacherList,
            message:"list_found"
        });
    }
    else{
console.log("Invalid_orgCode");
res.send({
    message:"Invalid_orgCode"
});
    }
}).catch(err=>console.log(err.message));

}
else if(currentRole==="Teacher"){
const {studentClass,studentSection}= req.body;
organisation.findOne({orgCode}).then(orgFound =>{
    if(orgFound){
console.log(orgFound.orgStudent);
var studentListDisplay = new Array();

const studentList = orgFound.orgStudent.map((student) =>{
    if(student.studentClass == studentClass && student.studentSection == studentSection){
       studentListDisplay.push({
        studentName:student.studentName,
        studentRollNo: student.studentRollNo,
        studentEmail:student.studentEmail
       });          
    }
});

res.send({
    list: studentListDisplay,
    message:"list_found"
});

    }
    else{
        console.log("Invalid_orgCode");
        res.send({
            message:"Invalid_orgCode"
        });
    }
}).catch(err=>console.log(err.message));

}
else{
    console.log("wrong role");
res.send({
message:"Invalid_role"
});
}
    }
    else{
console.log("Invalid_orgCode");
res.send({
    message:"Invalid_orgCode"
});
    }
}).catch(err=> console.log(err));


});

router.post("/teacher/details",authController.authenticate,(req,res,next)=>{
var {orgCode,teacherCode}= req.body;
organisation.findOne({orgCode}).then(orgFound=>{
if(orgFound){
var teacherDetails=_.findIndex(orgFound.orgTeachers,{
    teacherCode:teacherCode
});
if(teacherDetails>=0){
console.log(orgFound.orgTeachers[teacherDetails].teachingClasses);
res.send({
    teacherClass: orgFound.orgTeachers[teacherDetails].teachingClasses,
    message:"teacher_detail_found"
});
}
else{
    console.log("Invalid_teacherCode");
res.send({
    message:"Invalid_teacherCode"
});
}
}
else{
   console.log("Invalid_orgCode");
res.send({
    message:"Invalid_orgCode"
});
}
}).catch(err=>console.log(err.message));
});


router.post("/changeState",authController.authenticate,(req,res,next)=>{
   var {orgCode,teacherCode} = req.body;
organisation.findOne({orgCode}).then(orgFound=>{
    if(orgFound){
var teacherDetails = _.findIndex(orgFound.orgTeachers,{
    teacherCode:teacherCode
});

if(teacherDetails>=0){
    orgFound.orgTeachers[teacherDetails].active= !orgFound.orgTeachers[teacherDetails].active;

    orgFound.save().then(statechanged=>{
    res.send({
        message: "state_changed"
    });
    }).catch(err=>console.log(err.message));
}
else{
    console.log("Invalid_teacherCode");
    res.send({
        message:"invalid_teacherCode"
    });
}
    }
    else{
        console.log("Invalid_orgCode");
        res.send({
            message:"invalid_orgCode"
        });
    }
}).catch(err=>console.log(err.message));
});


//edit teachers details
// router.post("/teacher/edit",authController.authenticate,(req,res,next)=>{
// var {orgCode,oldTeacherCode} = req.body;
// organisation.findOne({
// orgCode
// }).then(orgFound=>{
//     if(orgFound){
// var teacherIndex= _.findIndex(orgFound.orgTeachers,{
//     teacherCode:oldTeacherCode
// });
// if(teacherIndex>=0){
// console.log(orgFound.orgTeachers[teacherIndex]);
// var classLength = orgFound.orgTeachers[teacherIndex].teachingClasses;
//  if(classLength>0){
//     orgFound.orgTeachers[teacherIndex].teachingClasses = [];
//  }


// // {


// //     teacherName: 'ash',
// //     teacherAge: 25,
// //     teacherDesignation: 'edut',
// //     teacherCode: '356',
// //     teacherGender: 'female',
// //     role: 'Teacher',
// //     teacherEmail: 'ash@gmail.com',
// //     teacherPassword: '$2a$10$oc9.upbZzoAN6RKVWytTdOtvLDS8gqGWrSXq6QXNepOuVDqmd.s/W',
// //     teacherMobile: 9876540123,
// //     schedules: []
// //   }

// }
// else{
//     console.log("Invalid_teacherCode");
//     res.send({
//         message:"invalid_data"
//     });
// }
//     }
//     else{
//         console.log("Invalid_orgCode");
//         res.send({
//             message:"invalid_data"
//         });
//     }
// }).catch(err=>console.log(err.message));
// });



router.post("/student/subject",authController.authenticate,(req,res,next)=>{
var {orgCode,studentClass,studentSection} = req.body;
organisation.findOne({
    orgClasses:{$elemMatch:{orgClass:studentClass}},
    orgClasses:{$elemMatch:{orgSection:studentSection}},

}).then(orgFound=>{
 if(orgFound){
  var classIndex = _.findIndex(orgFound.orgClasses,
{
 orgClass:studentClass,orgSection:studentSection
}); 
 
  console.log(classIndex);
  if(classIndex>=0){
      var subjectArray = new Array();
    console.log(orgFound.orgClasses[classIndex].orgSubjects);
    var subjects= orgFound.orgClasses[classIndex].orgSubjects.map(subject =>{
        subjectArray.push(subject.subjects);
    });
    res.send({
        list: subjectArray,
        message:"subject_found"
    });
  }
  else{
        console.log("Invalid_class");
        res.send({
            message:"no_data"
        });
  }
 }
 else{
       console.log("Invalid_orgCode");
        res.send({
            message:"no_data"
        });
 }
}).catch(err=>console.log(err.message));
});


router.post("/org/need",authController.authenticate,(req,res,next)=>{
var {orgCode,need} = req.body;
organisation.findOne({orgCode}).then(orgFound=>{
 if(orgFound){
if(need=="Teacher"){
    var orgTeacher = new Array();
var teacherList = orgFound.orgTeachers.map(teacher=>{
orgTeacher.push(teacher.teacherName);
});
console.log(orgTeacher);
res.send({
    list:orgTeacher,
    message: "list_found"
});
}
else if(need == "Subject"){

    var orgSubject = new Array();
    var classList = orgFound.orgClasses.map(subject=>{
        // console.log(subject);
      var subjectList = subject.orgSubjects.map(singleClassSubject=>{
orgSubject.push(singleClassSubject.subjects);
      });
    });
    console.log(orgSubject);
    res.send({
        list:orgSubject,
        message: "list_found"
    });

}
 }
 else{
    console.log("Invalid_orgCode");
    res.send({
        message:"no_data"
    });
 }
}).catch(err=>console.log(err.message));
});



router.post("/notification/list",(req,res,next)=>{
var {orgCode,role}= req.body;
var list=[];
organisation.findOne({orgCode}).then(orgFound=>{
if(orgFound){
if(role==="Teacher"){
    console.log("Teacher");
   var {teacherCode}= req.body;
   var teacherIndex = _.findIndex(orgFound.orgTeachers,{
       teacherCode:teacherCode
   });
   if(teacherIndex>=0){
    list = orgFound.orgTeachers[teacherIndex].notification;
   }
   else{
    console.log("teacher not found");
    res.send({
        message:"no_data"
    }); 
   }
}
else if(role=="Student"){
var {studentClass,studentSection,studentRollNo}= req.body;
var studentIndex= _.findIndex(orgFound.orgStudent,{
    studentClass:studentClass,studentSection:studentSection,studentRollNo:studentRollNo
});
console.log(studentIndex);
if(studentIndex>=0){
 list = orgFound.orgStudent[studentIndex].notification;
}
else{
    console.log("student not found");
    res.send({
        message:"no_data"
    });
}
}
var finalList= new Array();
var notificationList = list.map(noti=>{
finalList.push(noti.message);
});
console.log(list);
res.send({
    list:finalList,
    message:"list_found"
})

}
else{
    console.log("invalid_orgCode");
    res.send({
        message:"no_data"
    });
}
}).catch(err=>{
    console.log(err.message);
})
});

module.exports = router;