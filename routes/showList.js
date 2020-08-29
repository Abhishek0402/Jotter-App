const express = require("express");
const router = express.Router(); //routing

const authController = require("../Controller/authController");

const showListController = require("../Controller/showListController");

router.post("/showList",authController.authenticate,showListController.showList);

router.post("/teacher/details",authController.authenticate,showListController.teacherDetails);

router.post("/changeState",authController.authenticate,showListController.showList);

router.post("/student/subject",authController.authenticate,showListController.studentSubjectList);
    
router.post("/org/need",authController.authenticate,showListController.orgNeed);

router.post("/notification/list",authController.authenticate,showListController.notificationList);

router.post("/teacher/edit",authController.authenticate,showListController.teacherEdit);

module.exports = router;