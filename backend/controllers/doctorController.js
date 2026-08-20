const Doctor = require("../models/Doctor");

exports.createDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);

        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getDoctors = async (req, res) => {
    try {
        const { specialization } = req.query;

        let filter = {};

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