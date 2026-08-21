const express = require("express");

const router = express.Router();

const {
  getPatients,
} = require("../controllers/patientController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Get all patients - Admin only
router.get(
  "/",
  protect,
  authorize("ADMIN"),
  getPatients
);

module.exports = router;