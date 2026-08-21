const User = require("../models/User");

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.find({
      role: "PATIENT",
    }).select("-password");

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};