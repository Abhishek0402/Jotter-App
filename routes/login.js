const express = require("express");
const router = express.Router(); //routing

const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const loginController = require("../Controller/loginController");

router.post("/login",loginController.login);


module.exports = router;