const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
var cors = require("cors");
var path = require("path");
var multer = require("multer");
var forms = multer();
const cron = require("node-cron");
//@ cron
const mailer = require("./utility/mailer");
var organisation= require("./models/organisation");
var gcm = require("node-gcm");
var notificationKey = require("./config/notification");

var sender = new gcm.Sender(notificationKey.serverKey);

//@ routes

const register = require("./routes/register");
const login = require("./routes/login");
const showList = require("./routes/showList");
const schedule = require("./routes/schedule");
const question = require("./routes/question");
const passwordChange = require("./routes/passwordChange");
const version = require("./routes/version");

const app = express();

//@ mongodb connection
const db = require("./config/mongoDb").mongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Mongodb Connected"))
  .catch(err => console.log(err));
mongoose.Promise = global.Promise;


// app.use(forms.array());

app.use(bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
 

app.use("/api/app", register);
app.use("/api/app", login);
app.use("/api/app", showList);
app.use("/api/app", schedule);
app.use("/api/app", question);
app.use("/api/app", passwordChange);
app.use("/api/app",version);

app.use((err, req, res, next) => {
  res.status(422).send({
    error: err.field
  });
});

//listen for request
app.listen(process.env.PORT || 4240, () => {
  console.log("now listening for request");
});