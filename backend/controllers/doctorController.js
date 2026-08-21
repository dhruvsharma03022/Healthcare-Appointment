const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            specialization,
            workingHours,
            slotDuration,
            leaveDates
        } = req.body;

        // Check if doctor already exists
        const existingDoctor =
            await Doctor.findOne({ email });

        if (existingDoctor) {
            return res.status(400).json({
                message: "Doctor already exists"
            });
        }

        // Check if User already exists
        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "A user with this email already exists"
            });
        }

        // Default doctor password
        const hashedPassword =
            await bcrypt.hash("123456", 10);

        // Create login account
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "DOCTOR"
        });

        // Create doctor profile
        const doctor = await Doctor.create({
            name,
            email,
            specialization,
            workingHours,
            slotDuration,
            leaveDates
        });

        res.status(201).json({
            message:
                "Doctor created successfully. Default password is 123456.",
            doctor
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getDoctors = async (req, res) => {
    try {
        const { name, specialization } = req.query;

        let filter = {};

        if (name) {
            filter.name = {
                $regex: name,
                $options: "i"
            };
        }

        if (specialization) {
            filter.specialization = {
                $regex: specialization,
                $options: "i"
            };
        }

        const doctors = await Doctor.find(filter);

        res.status(200).json(doctors);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.addLeaveDate = async (req, res) => {
    try {
        const { date } = req.body;

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        if (doctor.leaveDates.includes(date)) {
            return res.status(400).json({
                message: "Leave date already exists"
            });
        }

        doctor.leaveDates.push(date);

        await doctor.save();

        res.status(200).json(doctor);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json(doctor);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(
            req.params.id
        );

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            message: "Doctor deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getMyDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        res.status(200).json(doctor);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};