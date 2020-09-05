const express = require("express");
const router = express.Router(); //routing

// const dotenv = require("dotenv");
// dotenv.config();


router.post("/version",(req,res) =>{
    var {version} = req.body;
var dbVersion = process.env.VERSION;
console.log(`version is ${version}`);
console.log(`db version is ${dbVersion}`);
if(version==dbVersion){
console.log("matched");
res.send({
    message:"matched"
});
}
else{
    console.log("not matched");
    res.send({
        message:"not_matched"
    });
}

});


module.exports = router;