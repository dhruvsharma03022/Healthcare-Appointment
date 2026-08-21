const express = require("express");

const router = express.Router();

const {
    createPrescription,
    getMyPrescriptions
} = require("../controllers/prescriptionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");


// Doctor creates prescription
router.post(
    "/",
    protect,
    authorize("DOCTOR"),
    createPrescription
);


// Patient views their prescriptions
router.get(
    "/my",
    protect,
    authorize("PATIENT"),
    getMyPrescriptions
);

module.exports = router;