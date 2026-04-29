const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  bulkMarkAttendance,
  getAttendance,
  updateAttendance,
  getMyAttendance,
  getMyAttendanceSummary,
  getAttendanceReport,
} = require("../controllers/attendanceController");

router.use(auth);

router.get("/my", role("employee"), getMyAttendance);
router.get("/summary", role("employee"), getMyAttendanceSummary);
router.get("/report", getAttendanceReport);
router.post("/bulk", role("admin"), bulkMarkAttendance);
router.get("/", getAttendance);
router.put("/:id", role("admin"), updateAttendance);

module.exports = router;
