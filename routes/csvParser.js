const express = require("express");
const router = express.Router(); //routing
var fs = require('fs');
var csv = require('fast-csv');
const csvController = require("../Controller/registerController");

router.post("/check",csvController.uploadCsv.single("student"), async (req, res, next) => {
    const file = req.file;
    console.log(file);
    console.log("ready");
        await fileController.read(file.originalname).then(async data => {
            await utilController.csvParser(data.Body.toString()).then(async data => {
                req.students = await JSON.stringify(data, null, 2);
                next();
             }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    
},csvController.addStudent);

module.exports = router;