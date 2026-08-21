const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
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

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },

        diagnosis: {
            type: String,
            required: true
        },

        medicines: [
            {
                name: {
                    type: String,
                    required: true
                },

                dosage: {
                    type: String,
                    required: true
                },

                duration: {
                    type: String,
                    required: true
                }
            }
        ],

        instructions: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Prescription",
    prescriptionSchema
);