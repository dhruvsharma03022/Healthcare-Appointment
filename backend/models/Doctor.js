const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    specialization: {
        type: String,
        required: true
    },

    workingHours: {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },

    slotDuration: {
        type: Number,
        default: 30
    },

    leaveDates: [
        {
            type: String
        }
    ]
});

module.exports = mongoose.model(
    "Doctor",
    doctorSchema
);