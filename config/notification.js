const dotenv = require("dotenv");
dotenv.config();

module.exports = {
serverKey: process.env.NOTIFICATION_SERVER_KEY
}