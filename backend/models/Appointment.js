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
        clinicalNotes: {
    type: String
},
        // AI-generated pre-visit summary
        preVisitSummary: {
            urgency: {
                type: String,
                enum: ["Low", "Medium", "High"]
            },

            chiefComplaint: {
                type: String
            },

            suggestedQuestions: [
                {
                    type: String
                }
            ]
        },
postVisitSummary: {
    summary: {
        type: String
    },

    medicationSchedule: [
        {
            medicine: String,
            dosage: String,
            duration: String
        }
    ],

    followUpSteps: [
        {
            type: String
        }
    ]
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
        unique: true,
        partialFilterExpression: {
            status: "BOOKED"
        }
    }
);

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);