const express = require("express");
const router = express.Router();

const { protect, authorize } =
require("../middleware/authMiddleware");

const {
    adminDashboard,
    getAllPatients
} = require("../controllers/adminController");

router.get(
    "/dashboard",
    protect,
    authorize("ADMIN"),
    adminDashboard
);

router.get(
    "/patients",
    protect,
    authorize("ADMIN"),
    getAllPatients
);
module.exports = router;