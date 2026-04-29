const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  addEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

router.use(auth);

router.post("/", role("admin"), addEmployee);
router.get("/", role("admin"), getAllEmployees);
router.get("/:id", getEmployee);
router.put("/:id", role("admin"), updateEmployee);
router.delete("/:id", role("admin"), deleteEmployee);

module.exports = router;
