const express = require("express");
const router = express.Router(); //routing

const authController = require("../Controller/authController");
const imageUploader = require("../utility/imageUploader");
const assignmentController = require("../Controller/assignmentController");

router.post("/assignment/create", authController.authenticate,imageUploader.uploadImage.single("file"),assignmentController.createAssignment);

router.post("/assignment/readAssignment",authController.authenticate,assignmentController.readAssignment);

router.post("/assignment/delete",authController.authenticate,assignmentController.deleteAssignment);

router.post("/assignment/readStudent",authController.authenticate,assignmentController.readStudent);

router.post("/assignment/submitAnswer",authController.authenticate,imageUploader.uploadImage.single("file"),assignmentController.submitAnswer);

router.post("/assignment/giveRemark",authController.authenticate,assignmentController.giveRemark);

router.post("/assignment/deleteAnswer",authController.authenticate,assignmentController.deleteAnswer);




module.exports = router;