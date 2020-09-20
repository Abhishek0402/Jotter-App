const express = require("express");
const router = express.Router(); //routing

const authController = require("../Controller/authController");
const imageUploader = require("../utility/imageUploader");
const assignmentController = require("../Controller/assignmentController");

router.post("/assignment/create", authController.authenticate,imageUploader.uploadImage.single("file"),assignmentController.createAssignment);

router.post("/assignment/readAssignment",assignmentController.readAssignment);

router.post("/assignment/delete", assignmentController.deleteAssignment);

router.post("/assignment/readStudent",assignmentController.readStudent);

router.post("/assignment/giveRemark",assignmentController.giveRemark);

router.post("/assignment/submitAnswer",assignmentController.submitAnswer);

router.post("/assignment/deleteAnswer",assignmentController.deleteAnswer);




module.exports = router;