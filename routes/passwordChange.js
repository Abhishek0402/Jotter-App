const express = require("express");
const router = express.Router(); //routing

const passwordChangeController = require("../Controller/passwordChangeController");

router.post("/user/sendOtp",passwordChangeController.sendOtp);

router.post("/user/verifyOtp",passwordChangeController.verifyOtp);

router.post("/user/changePassword",passwordChangeController.changePassword);

module.exports = router;
