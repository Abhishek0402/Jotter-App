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

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const awsStorage = multerS3({
    s3: s3,
    bucket: awsConfig.bucket,
    ACL: 'public-read',
    key: function (req, file, cb) {
        console.log("file");
        console.log(file);
        cb(null, file.originalname);
    }
});

const checkFileType = (file, type, cb) => {
    let filetypes;
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
        console.log("cba");
        checkFileType(file, "csv", cb);
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

exports.addStudent = async (req, res) => {
    console.log(req.body);
    if (req.students) {
        var arr = JSON.parse(req.students);
        console.log(arr);
        const students = await arr.map((item) => {
            return {
                name: item.name.toUpperCase(),
                stdNo: item.stdNo,
                year: item.year,
                branch: item.branch.toUpperCase(),
                email: item.email.toLowerCase(),
                mobile: item.mobile,
                img: 'https://raw.githubusercontent.com/amolsr/Asset/master/Students/' + item.stdNo + '.jpg'
            };
        });
        Student.insertMany(students).then((result) => {
            if (result.length > 0) {
                res.sendStatus(200)
            } else {
                res.sendStatus(304)
            }
        }).catch((err) => {
            console.log(err)
            res.sendStatus(500)
        })
     }
     else {
        const {
            name,
            stdNo,
            year,
            email,
            mobile,
            branch
        } = req.body;
        Student.findOne({
            stdNo: stdNo
        }).then(async student => {
            if (student) {
                res.status(409).json({
                    msg: "Student Exist"
                });
            } else {
                await Student.create({
                    name: name.toUpperCase(),
                    stdNo: stdNo,
                    year: year,
                    branch: branch.toUpperCase(),
                    email: email.toLowerCase(),
                    mobile: mobile,
                    img: 'https://raw.githubusercontent.com/amolsr/Asset/master/Students/' + stdNo + '.jpg'
                }).then(student => {
                    res.status(200).json({
                        student: student,
                        msg: "success"
                    });
                }).catch(err => {
                    res.status(500).json({
                        msg: "failed"
                    })
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                msg: "failed"
            })
        });
    }
};
