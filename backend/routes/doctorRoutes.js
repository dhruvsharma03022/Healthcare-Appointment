const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getDoctors,
    addLeaveDate
} = require("../controllers/doctorController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.get("/", getDoctors);
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createDoctor
);
router.put(
    "/:id/leave",
    protect,
    authorize("ADMIN"),
    addLeaveDate
);
module.exports = router;