const express = require("express");
const router = express.Router(); //routing

const authController = require("../Controller/authController");

const scheduleController = require("../Controller/scheduleController");

router.post("/schedule/create",authController.authenticate,scheduleController.createSchedule);

router.post("/schedule/read",authController.authenticate,scheduleController.readSchedule);

router.post("/schedule/update",authController.authenticate,scheduleController.updateSchedule);

router.post("/schedule/delete",authController.authenticate,scheduleController.deleteSchedule);

router.post("/schedule/student/list",authController.authenticate,scheduleController.studentList);

module.exports = router;