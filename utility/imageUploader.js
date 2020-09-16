const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const awsConfig = require('../config/aws');

AWS.config.update({
    secretAccessKey: awsConfig.secretAccessKey,
    accessKeyId: awsConfig.accessKeyId,
    region: awsConfig.region
});

const s3 = new AWS.S3();

const awsStorage = multerS3({
    s3: s3,
    bucket: awsConfig.bucket,
    ACL: 'public-read',
    key: function (req, file, cb) {
        console.log("file");
        cb(null, file.originalname);
    }
});


const checkFileType = (methodToCreate,file, type, cb) => {
    let filetypes;
    console.log("check 2")
    if(methodToCreate==="Manual"){
        next();
    }
    if (type === "image") {
        filetypes = /jpeg|jpg|png|gif/;
    } 
    if(type==="pdf"){
        filetypes = /pdf/;
    }
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
console.log(`extension ${extname}`);
console.log(`mimetype ${filetypes}`);
    if (mimetype || extname) {
        console.log("check 3");
        return cb(null, true);
    } else {
        cb("Error: Invalid File Only!");
    }
};

exports.uploadImage = multer({
    storage: awsStorage,
    limits: { fileSize: 50000000 },
    key: function (req, file, cb) {     
            cb(null, file.originalname);
    },
    fileFilter: function (req, file, cb) {
        console.log(req.body);
        if(req.body.role==="Organisation") {
            console.log("check1 pass");
            checkFileType(req.body.methodToCreate,file, "image", cb);
        }  
        else if(req.body.role ==="Assignment" && req.body.assignmentType==="image"){
            checkFileType("File",file,"image",cb);
        }
        else if(req.body.role ==="Assignment" && req.body.assignmentType==="pdf"){
            checkFileType("File",file,"pdf",cb);
        }
    }
});
