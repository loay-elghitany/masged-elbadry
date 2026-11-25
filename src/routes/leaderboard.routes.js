const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getTopStudents,
  getGroupsLeaderboard,
} = require("../controllers/leaderboard.controller");

const router = express.Router();

router.get("/", getTopStudents);
router.get("/students", getTopStudents);

router.use(authMiddleware);
router.use(roleMiddleware("SuperAdmin", "Teacher", "Student", "Parent"));

router.get("/groups", getGroupsLeaderboard);

module.exports = router;
