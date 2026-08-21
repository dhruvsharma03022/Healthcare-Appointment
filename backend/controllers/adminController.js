const User = require("../models/User");

exports.adminDashboard = async (req, res) => {
    res.json({
        message: "Welcome Admin"
    });
};

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: "PATIENT" }).select("-password");
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};