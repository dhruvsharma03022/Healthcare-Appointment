const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================================
// DOCTOR LEAVE DATES
// =====================================================

// ADD LEAVE DATE - DOCTOR
exports.addLeaveDate = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                message: "Leave date is required"
            });
        }

        // Find doctor using logged-in doctor's email
        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // Prevent duplicate leave
        if (doctor.leaveDates.includes(date)) {
            return res.status(400).json({
                message:
                    "This date is already marked as leave"
            });
        }

        // Add leave date
        doctor.leaveDates.push(date);

        // Keep dates sorted
        doctor.leaveDates.sort();

        await doctor.save();

        res.status(200).json({
            message:
                "Leave date added successfully",
            leaveDates: doctor.leaveDates
        });

    } catch (error) {

        console.error(
            "Add leave date error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// REMOVE LEAVE DATE - DOCTOR
exports.removeLeaveDate = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                message: "Leave date is required"
            });
        }

        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        doctor.leaveDates =
            doctor.leaveDates.filter(
                (leaveDate) =>
                    leaveDate !== date
            );

        await doctor.save();

        res.status(200).json({
            message:
                "Leave date removed successfully",
            leaveDates: doctor.leaveDates
        });

    } catch (error) {

        console.error(
            "Remove leave date error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// GET MY LEAVE DATES - DOCTOR
exports.getMyLeaveDates = async (req, res) => {
    try {

        const doctor = await Doctor.findOne({
            email: req.user.email
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        res.status(200).json({
            leaveDates: doctor.leaveDates
        });

    } catch (error) {

        console.error(
            "Get leave dates error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// CREATE DOCTOR
// =====================================================

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

        const existingDoctor =
            await Doctor.findOne({ email });

        if (existingDoctor) {
            return res.status(400).json({
                message:
                    "Doctor already exists"
            });
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "A user with this email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                "123456",
                10
            );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "DOCTOR"
        });

        const doctor = await Doctor.create({
            name,
            email,
            specialization,
            workingHours,
            slotDuration,
            leaveDates: leaveDates || []
        });

        res.status(201).json({
            message:
                "Doctor created successfully. Default password is 123456.",
            doctor
        });

    } catch (error) {

        console.error(
            "Create doctor error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET DOCTORS
// =====================================================

exports.getDoctors = async (req, res) => {
    try {

        const {
            name,
            specialization
        } = req.query;

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

        const doctors =
            await Doctor.find(filter);

        res.status(200).json(doctors);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// ADMIN ADD LEAVE DATE
// =====================================================

exports.addAdminLeaveDate = async (req, res) => {
    try {

        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                message:
                    "Leave date is required"
            });
        }

        const doctor =
            await Doctor.findById(
                req.params.id
            );

        if (!doctor) {
            return res.status(404).json({
                message:
                    "Doctor not found"
            });
        }

        if (
            doctor.leaveDates.includes(date)
        ) {
            return res.status(400).json({
                message:
                    "Leave date already exists"
            });
        }

        doctor.leaveDates.push(date);
        doctor.leaveDates.sort();

        await doctor.save();

        res.status(200).json({
            message:
                "Leave date added successfully",
            doctor
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// UPDATE DOCTOR
// =====================================================

exports.updateDoctor = async (req, res) => {
    try {

        const doctor =
            await Doctor.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!doctor) {
            return res.status(404).json({
                message:
                    "Doctor not found"
            });
        }

        res.status(200).json(doctor);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// DELETE DOCTOR
// =====================================================

exports.deleteDoctor = async (req, res) => {
    try {

        const doctor =
            await Doctor.findByIdAndDelete(
                req.params.id
            );

        if (!doctor) {
            return res.status(404).json({
                message:
                    "Doctor not found"
            });
        }

        res.status(200).json({
            message:
                "Doctor deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET MY DOCTOR PROFILE
// =====================================================

exports.getMyDoctorProfile = async (req, res) => {
    try {

        const doctor =
            await Doctor.findOne({
                email: req.user.email
            });

        if (!doctor) {
            return res.status(404).json({
                message:
                    "Doctor profile not found"
            });
        }

        res.status(200).json(doctor);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};