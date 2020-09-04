const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME
};