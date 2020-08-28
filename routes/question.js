const express = require("express");
const router = express.Router(); //routing

const authController = require("../Controller/authController");

const questionController = require("../Controller/questionController");

router.post("/question/ask",authController.authenticate,questionController.askQuestion);

router.post("/question/reply/create",authController.authenticate,questionController.replyQuestion);

router.post("/question/read",authController.authenticate,questionController.readQuestion);

router.post("/question/reply/read",authController.authenticate,questionController.readReply);

router.post("/question/delete",authController.authenticate,questionController.deleteQuestion);

router.post("/question/reply/delete",authController.authenticate,questionController.deleteReply);

module.exports = router;
