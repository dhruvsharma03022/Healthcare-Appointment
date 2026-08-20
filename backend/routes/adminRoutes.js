const express = require("express");
const router = express.Router();

const { protect, authorize } =
require("../middleware/authMiddleware");

const {
    adminDashboard
} = require("../controllers/adminController");

router.get(
    "/dashboard",
    protect,
    authorize("ADMIN"),
    adminDashboard
);

module.exports = router;