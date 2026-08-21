const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const {
    generatePostVisitSummary
} = require("../services/llmService");
exports.createPrescription = async (req, res) => {
    try {
        const {
            appointmentId,
            diagnosis,
            medicines,
            instructions,
            clinicalNotes
        } = req.body;

        // 1. Find logged-in doctor
        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // 2. Find appointment
        const appointment =
            await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // 3. Check doctor owns appointment
        if (
            appointment.doctor.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only create prescriptions for your own appointments"
            });
        }

        // 4. Generate post-visit summary
        let postVisitSummary = null;

        try {
            postVisitSummary =
                await generatePostVisitSummary({
                    clinicalNotes,
                    diagnosis,
                    medicines,
                    instructions
                });

        } catch (error) {
            console.error(
                "Post-visit summary generation failed:",
                error.message
            );
        }

        // 5. Save post-visit information
        appointment.clinicalNotes =
            clinicalNotes;

        appointment.postVisitSummary =
            postVisitSummary;

        appointment.status =
            "COMPLETED";

        await appointment.save();

        // 6. Create prescription
        const prescription =
            await Prescription.create({
                patient: appointment.patient,
                doctor: doctor._id,
                appointment: appointment._id,
                diagnosis,
                medicines,
                instructions
            });

        // 7. Send response
        res.status(201).json({
            message:
                "Prescription created successfully",

            prescription,

            postVisitSummary
        });

    } catch (error) {

        console.error(
            "Prescription creation error:",
            error
        );

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
                "appointmentTime postVisitSummary"
            )
            .sort({
                createdAt: -1
            });

        console.log(
            "PRESCRIPTIONS:",
            JSON.stringify(
                prescriptions,
                null,
                2
            )
        );

        res.status(200).json(prescriptions);

    } catch (error) {
        console.error(
            "Failed to fetch prescriptions:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};