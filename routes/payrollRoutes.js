const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  runPayroll,
  getPayroll,
  getMyPayroll,
  getLatestPayslip,
} = require("../controllers/payrollController");

router.use(auth);

router.post("/run", role("admin"), runPayroll);
router.get("/my", role("employee"), getMyPayroll);
router.get("/latest", role("employee"), getLatestPayslip);
router.get("/:employeeId", getPayroll);

module.exports = router;
