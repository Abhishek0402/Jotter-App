const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const awsConfig = require('../config/aws');
const csv = require('csv');

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
        cb(null, Date.now().toString() + file.originalname);
    }
});


const checkFileType = (methodToCreate,file, type, cb) => {
    let filetypes;
    if(methodToCreate === "Manual"){
        next();
    }
    if (type === "image") {
        filetypes = /jpeg|jpg|png|gif/;
    } else if (type === "csv") {
        console.log("file csv");
        filetypes = /csv/;
    }
    
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
console.log(`extension ${extname}`);
console.log(`mimetype ${filetypes}`);

    if (mimetype || extname) {
        return cb(null, true);
    } else {
        cb("Error: Invalid File Only!");
    }
};


exports.uploadCsv = multer({
    storage: awsStorage,
    limits: { fileSize: 5000000 },
    key: function (req, file, cb) {
        console.log("abc");
        cb(null, Date.now().toString() + file.originalname)
    },
    fileFilter: function (req, file, cb) {
        console.log("body test");
        console.log(req.body);
        if(req.body.role === '"Organisation"'){
            checkFileType(req.body.methodToCreate,file, "image", cb);
        }
        else{
            checkFileType(req.body.methodToCreate,file, "csv", cb);
        }
      
    }
});


exports.read = async (url) => {
    var params = {
        Bucket: awsConfig.bucket,
        Key: url
    };
    return new Promise((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if (err) reject(err);
            else {
                resolve(data)
            }
        })
    })
};

exports.csvParser = async (url) => {
    var csvString = url;
    return new Promise(((resolve, reject) => {
        csv.parse(csvString, { columns: true }, function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    }))
};
