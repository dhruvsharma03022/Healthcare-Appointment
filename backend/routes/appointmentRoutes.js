const express = require("express");
const router = express.Router();

const {
    bookAppointment,
    getMyAppointments,
    cancelAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getAllAppointments,
    getPatientAppointments,
    getAvailableSlots,
    getMyAppointmentHistory
} = require("../controllers/appointmentController");
const {
    protect,
    authorize
} = require("../middleware/authMiddleware");
router.get(
    "/patient/:patientId",
    protect,
    authorize("ADMIN"),
    getPatientAppointments
);
router.post(
    "/",
    protect,
    authorize("PATIENT"),
    bookAppointment
);
router.get(
    "/my/history",
    protect,
    authorize("PATIENT"),
    getMyAppointmentHistory
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
    authorize("PATIENT", "ADMIN"),
    cancelAppointment
);
router.get(
    "/doctor/:doctorId/available-slots",
    protect,
    authorize("PATIENT"),
    getAvailableSlots
);
router.get(
    "/doctor/:doctorId",
    protect,
    authorize("ADMIN","DOCTOR"),
    getDoctorAppointments
);
router.put(
    "/:id/status",
    protect,
    authorize("ADMIN","DOCTOR"),
    updateAppointmentStatus
);
router.get(
    "/",
    protect,
    authorize("ADMIN"),
    getAllAppointments
);

module.exports = router;