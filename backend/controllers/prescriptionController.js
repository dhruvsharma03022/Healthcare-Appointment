const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

exports.createPrescription = async (req, res) => {
    try {
        const {
            appointmentId,
            diagnosis,
            medicines,
            instructions
        } = req.body;

        // Find the logged-in doctor's Doctor document
        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // Find appointment
        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure this appointment belongs to this doctor
        if (
            appointment.doctor.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only create prescriptions for your own appointments"
            });
        }

        // Create prescription
        const prescription =
            await Prescription.create({
                patient: appointment.patient,
                doctor: doctor._id,
                appointment: appointment._id,
                diagnosis,
                medicines,
                instructions
            });

        res.status(201).json({
            message:
                "Prescription created successfully",
            prescription
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.getMyPrescriptions = async (req, res) => {
    try {
        const prescriptions =
            await Prescription.find({
                patient: req.user._id
            })
            .populate(
                "doctor",
                "name specialization"
            )
            .populate(
                "appointment",
                "appointmentTime"
            )
            .sort({ createdAt: -1 });

        res.status(200).json(prescriptions);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};