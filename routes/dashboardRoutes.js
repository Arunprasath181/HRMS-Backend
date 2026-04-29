const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

router.use(auth);
router.use(role("admin"));

router.get("/summary", getDashboardSummary);

module.exports = router;
