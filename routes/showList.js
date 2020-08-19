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
module.exports = router;