const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ap-south-1',
    bucket: 'smartclassapp'
};