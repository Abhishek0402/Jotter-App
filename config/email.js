const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    email: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST
} 