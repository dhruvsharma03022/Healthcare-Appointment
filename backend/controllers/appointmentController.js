const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

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
        const appointmentDateTime = new Date(appointmentTime);
        if (appointmentDateTime <= new Date()) {
    return res.status(400).json({
        message: "Cannot book an appointment in the past"
    });
}

const appointmentHours = appointmentDateTime
    .getUTCHours();

const appointmentMinutes = appointmentDateTime
    .getUTCMinutes();

const appointmentTotalMinutes =
    appointmentHours * 60 + appointmentMinutes;

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
    appointmentTotalMinutes < startTotalMinutes ||
    appointmentTotalMinutes >= endTotalMinutes
) {
    return res.status(400).json({
        message: "Appointment time is outside doctor's working hours"
    });
}
const slotDuration = doctor.slotDuration;

const minutesFromStart =
    appointmentTotalMinutes - startTotalMinutes;

if (minutesFromStart % slotDuration !== 0) {
    return res.status(400).json({
        message: `Appointment time must be in ${slotDuration}-minute slots`
    });
}
        // 3. Check if slot is already booked
        const existingAppointment =
            await Appointment.findOne({
                doctor: doctorId,
                appointmentTime: new Date(appointmentTime),
                status: "BOOKED"
            });

        if (existingAppointment) {
            return res.status(400).json({
                message: "This appointment slot is already booked"
            });
        }

        // Temporary response
        const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointmentTime: new Date(appointmentTime),
    symptoms,
    status: "BOOKED"
});

res.status(201).json({
    message: "Appointment booked successfully",
    appointment
});

    } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({
            message: "This appointment slot is already booked"
        });
    }

    res.status(500).json({
        message: error.message
    });
}
};exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patient: req.user._id
        })
            .populate("doctor", "name specialization")
            .sort({ appointmentTime: 1 });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.status === "CANCELLED") {
            return res.status(400).json({
                message: "Appointment is already cancelled"
            });
        }

        appointment.status = "CANCELLED";

        await appointment.save();

        res.status(200).json({
            message: "Appointment cancelled successfully",
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