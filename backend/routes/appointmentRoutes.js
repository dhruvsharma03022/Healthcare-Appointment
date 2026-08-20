const express = require("express");
const router = express.Router();

const {
    bookAppointment,
    getMyAppointments,
    cancelAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getAllAppointments
} = require("../controllers/appointmentController");
const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    authorize("PATIENT"),
    bookAppointment
);
router.get(
    "/my",
    protect,
    authorize("PATIENT"),
    getMyAppointments
);
router.put(
    "/:id/cancel",
    protect,
    authorize("PATIENT"),
    cancelAppointment
);
router.get(
    "/doctor/:doctorId",
    protect,
    authorize("ADMIN"),
    getDoctorAppointments
);
router.put(
    "/:id/status",
    protect,
    authorize("ADMIN"),
    updateAppointmentStatus
);
router.get(
    "/",
    protect,
    authorize("ADMIN"),
    getAllAppointments
);
module.exports = router;