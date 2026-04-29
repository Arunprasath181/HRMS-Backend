const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { login, getMe } = require("../controllers/authController");

router.post("/login", login);
router.get("/me", auth, role("admin", "employee"), getMe);

module.exports = router;
