const express = require("express");
const router = express.Router(); //routing
const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");
const _ = require("lodash");
const authController = require("../Controller/authController");

router.post("/showList",authController.authenticate,(req,res,next)=>{
const {currentRole,orgCode} = req.body;

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
}
else if(currentRole === "Organisation"){

}
else if(currentRole==="Teacher"){

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

module.exports = router;