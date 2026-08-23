const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const {
    generatePreVisitSummary
} = require("../services/llmService");
exports.bookAppointment = async (req, res) => {
    try {
        const {
            doctorId,
            appointmentTime,
            symptoms
        } = req.body;

        const patientId = req.user._id;

        // 1. Check doctor exists
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // 2. Check doctor leave
        const appointmentDate =
            new Date(appointmentTime)
                .toISOString()
                .split("T")[0];

        if (doctor.leaveDates.includes(appointmentDate)) {
            return res.status(400).json({
                message: "Doctor is on leave on this date"
            });
        }

        // 3. Check appointment is not in the past
        const appointmentDateTime =
            new Date(appointmentTime);

        if (appointmentDateTime <= new Date()) {
            return res.status(400).json({
                message:
                    "Cannot book an appointment in the past"
            });
        }

        // 4. Check doctor's working hours
        const istTime = new Intl.DateTimeFormat(
    "en-IN",
    {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }
).format(appointmentDateTime);

const [appointmentHours, appointmentMinutes] =
    istTime.split(":").map(Number);

        const appointmentTotalMinutes =
            appointmentHours * 60 +
            appointmentMinutes;

        const [startHour, startMinute] =
            doctor.workingHours.start
                .split(":")
                .map(Number);

        const [endHour, endMinute] =
            doctor.workingHours.end
                .split(":")
                .map(Number);

        const startTotalMinutes =
            startHour * 60 + startMinute;

        const endTotalMinutes =
            endHour * 60 + endMinute;

        if (
            appointmentTotalMinutes <
                startTotalMinutes ||
            appointmentTotalMinutes >=
                endTotalMinutes
        ) {
            return res.status(400).json({
                message:
                    "Appointment time is outside doctor's working hours"
            });
        }

        // 5. Check slot duration
        const slotDuration =
            doctor.slotDuration;

        const minutesFromStart =
            appointmentTotalMinutes -
            startTotalMinutes;

        if (
            minutesFromStart %
            slotDuration !== 0
        ) {
            return res.status(400).json({
                message:
                    `Appointment time must be in ${slotDuration}-minute slots`
            });
        }

        // 6. Check if slot already booked
        const existingAppointment =
            await Appointment.findOne({
                doctor: doctorId,
                appointmentTime:
                    new Date(appointmentTime),
                status: "BOOKED"
            });

        if (existingAppointment) {
            return res.status(400).json({
                message:
                    "This appointment slot is already booked"
            });
        }

        // 7. Generate PRE-VISIT summary
        let preVisitSummary = null;

        try {
            preVisitSummary =
                await generatePreVisitSummary(
                    symptoms
                );
        } catch (error) {
            console.error(
                "Pre-visit summary generation failed:",
                error.message
            );
        }

        // 8. Create appointment
        const appointment =
            await Appointment.create({
                patient: patientId,
                doctor: doctorId,
                appointmentTime:
                    new Date(appointmentTime),
                symptoms,
                preVisitSummary,
                status: "BOOKED"
            });

        res.status(201).json({
            message:
                "Appointment booked successfully",
            appointment
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "This appointment slot is already booked"
            });
        }

        console.error(
            "Appointment booking error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patient: req.user._id,
            appointmentTime: {
                $gt: new Date()
            },
            status: "BOOKED"
        })
            .populate(
                "doctor",
                "name specialization"
            )
            .sort({
                appointmentTime: 1
            });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(
            req.params.id
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Patient can only cancel their own appointment
        if (req.user.role === "PATIENT") {
            if (
                appointment.patient.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You can only cancel your own appointment"
                });
            }
        }

        // Only BOOKED appointments can be cancelled
        if (appointment.status !== "BOOKED") {
            return res.status(400).json({
                message:
                    "Only booked appointments can be cancelled"
            });
        }

        appointment.status = "CANCELLED";

        await appointment.save();

        res.status(200).json({
            message:
                "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getDoctorAppointments = async (req, res) => {
    try {
        if (req.user.role === "DOCTOR") {
            const doctor = await Doctor.findOne({
                email: req.user.email
            });

            if (!doctor) {
                return res.status(404).json({
                    message: "Doctor profile not found"
                });
            }

            if (doctor._id.toString() !== req.params.doctorId) {
                return res.status(403).json({
                    message: "You can only view your own appointments"
                });
            }
        }

        const appointments = await Appointment.find({
            doctor: req.params.doctorId
        })
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .sort({ appointmentTime: 1 });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "BOOKED",
            "COMPLETED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid appointment status"
            });
        }

        const appointment = await Appointment.findById(
            req.params.id
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Doctors can only update their own appointments
        if (req.user.role === "DOCTOR") {
            const doctor = await Doctor.findOne({
                email: req.user.email
            });

            if (!doctor) {
                return res.status(404).json({
                    message: "Doctor profile not found"
                });
            }

            if (
                appointment.doctor.toString() !==
                doctor._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You can only update your own appointments"
                });
            }
        }

        appointment.status = status;

        await appointment.save();

        res.status(200).json({
            message: "Appointment status updated successfully",
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .sort({ appointmentTime: 1 });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    })
      .populate("doctor", "name specialization")
      .populate("patient", "name email")
      .sort({ appointmentTime: 1 });

    res.status(200).json(appointments);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Date is required"
            });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Check doctor leave
        if (doctor.leaveDates.includes(date)) {
            return res.status(200).json([]);
        }

        // ------------------------------------------------
        // Get appointments for this date
        // ------------------------------------------------

        // Start and end of the selected date in IST
        const startOfDay = new Date(
            `${date}T00:00:00+05:30`
        );

        const endOfDay = new Date(
            `${date}T23:59:59+05:30`
        );

        const appointments =
            await Appointment.find({
                doctor: doctorId,
                appointmentTime: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "BOOKED"
            });

        // Convert booked appointments to IST HH:MM
        const bookedTimes = appointments.map(
            (appointment) => {

                const appointmentDate =
                    new Date(
                        appointment.appointmentTime
                    );

                return new Intl.DateTimeFormat(
                    "en-IN",
                    {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    }
                ).format(appointmentDate);
            }
        );

        // ------------------------------------------------
        // Generate valid slots
        // ------------------------------------------------

        const slots = [];

        const [startHour, startMinute] =
            doctor.workingHours.start
                .split(":")
                .map(Number);

        const [endHour, endMinute] =
            doctor.workingHours.end
                .split(":")
                .map(Number);

        let currentMinutes =
            startHour * 60 + startMinute;

        const endMinutes =
            endHour * 60 + endMinute;

        const now = new Date();

        while (currentMinutes < endMinutes) {

            const hours =
                Math.floor(currentMinutes / 60);

            const minutes =
                currentMinutes % 60;

            const slotTime =
                `${String(hours).padStart(2, "0")}:${String(
                    minutes
                ).padStart(2, "0")}`;

            // Create slot specifically in IST
            const slotDateTime = new Date(
                `${date}T${slotTime}:00+05:30`
            );

            // Don't show past slots
            if (slotDateTime > now) {

                // Don't show booked slots
                if (!bookedTimes.includes(slotTime)) {
                    slots.push(slotTime);
                }
            }

            currentMinutes += doctor.slotDuration;
        }

        res.status(200).json(slots);

    } catch (error) {
        console.error(
            "Failed to get available slots:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};
exports.getMyAppointmentHistory = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patient: req.user._id
        })
            .populate(
                "doctor",
                "name specialization"
            )
            .sort({
                appointmentTime: -1
            });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
