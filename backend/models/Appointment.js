const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentTime: {
            type: Date,
            required: true
        },

        symptoms: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "BOOKED",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "BOOKED"
        }
    },
    {
        timestamps: true
    }
);
appointmentSchema.index(
    {
        doctor: 1,
        appointmentTime: 1
    },
    {
        unique: true
    }
);
module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);