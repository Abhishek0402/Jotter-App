const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    mongoURI: process.env.MONGO_URI
};
// mongodb+srv://Smart123:Smart123@cluster0.09nn1.mongodb.net/<dbname>?retryWrites=true&w=majority