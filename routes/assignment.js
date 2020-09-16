const express = require("express");
const router = express.Router(); //routing

const admin = require("../models/admin");
const organisation = require("../models/organisation");
const userData = require("../models/userData");

const assignmentController = require("../Controller/assignmentController");

router.post("/assignment/create",assignmentController.createAssignment);

router.post("/assignment/readAssignment",assignmentController.readAssignment);

router.post("/assignment/delete", assignmentController.deleteAssignment);

router.post("/assignment/readStudent",assignmentController.readStudent);

router.post("/assignment/giveRemark",assignmentController.giveRemark);

router.post("/assignment/submitAnswer",assignmentController.submitAnswer);

router.post("/assignment/deleteAnswer",assignmentController.deleteAnswer);




module.exports = router;