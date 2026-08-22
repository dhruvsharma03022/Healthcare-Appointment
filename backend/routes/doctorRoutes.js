const express = require("express");

const router = express.Router();

const {
    createDoctor,
    getDoctors,
    addAdminLeaveDate,
    updateDoctor,
    deleteDoctor,
    getMyDoctorProfile,
    addLeaveDate,
    removeLeaveDate,
    getMyLeaveDates
} = require("../controllers/doctorController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");


// =====================================================
// DOCTOR PROFILE
// =====================================================

router.get(
    "/me",
    protect,
    authorize("DOCTOR"),
    getMyDoctorProfile
);


// =====================================================
// PUBLIC / PATIENT
// =====================================================

router.get(
    "/",
    getDoctors
);


// =====================================================
// DOCTOR LEAVE MANAGEMENT
// IMPORTANT: These must come BEFORE /:id
// =====================================================

router.get(
    "/leave-dates",
    protect,
    authorize("DOCTOR"),
    getMyLeaveDates
);

router.post(
    "/leave-dates",
    protect,
    authorize("DOCTOR"),
    addLeaveDate
);

router.delete(
    "/leave-dates",
    protect,
    authorize("DOCTOR"),
    removeLeaveDate
);


// =====================================================
// ADMIN
// =====================================================

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
    addAdminLeaveDate
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