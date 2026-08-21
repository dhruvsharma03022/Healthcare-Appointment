const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getDoctors,
    addLeaveDate,
    updateDoctor,
    deleteDoctor,
    getMyDoctorProfile
} = require("../controllers/doctorController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");
router.get(
    "/me",
    protect,
    authorize("DOCTOR"),
    getMyDoctorProfile
);
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
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateDoctor
);

router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteDoctor
);
module.exports = router;