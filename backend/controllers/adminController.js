const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");

// const User = require("../models/User");
// const Doctor = require("../models/Doctor");
// const Appointment = require("../models/Appointment");
// const Prescription = require("../models/Prescription");

exports.getReports = async (req, res) => {
    try {

        const totalDoctors =
            await Doctor.countDocuments();

        const totalPatients =
            await User.countDocuments({
                role: "PATIENT"
            });

        const totalAppointments =
            await Appointment.countDocuments();

        const bookedAppointments =
    await Appointment.countDocuments({
        status: "BOOKED"
    });

const completedAppointments =
    await Appointment.countDocuments({
        status: "COMPLETED"
    });

const cancelledAppointments =
    await Appointment.countDocuments({
        status: "CANCELLED"
    });

        const totalPrescriptions =
            await Prescription.countDocuments();

        const doctorPerformance =
            await Appointment.aggregate([
                {
                    $group: {
                        _id: "$doctor",
                        totalAppointments: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        totalAppointments: -1
                    }
                }
            ]);

        const performanceData =
            await Doctor.populate(
                doctorPerformance,
                {
                    path: "_id",
                    select: "name"
                }
            );

       res.status(200).json({
  totalDoctors,
  totalPatients,
  totalAppointments,
  bookedAppointments,
  completedAppointments,
  cancelledAppointments,
  totalPrescriptions,
  doctorPerformance: performanceData
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};

exports.adminDashboard = async (req, res) => {
    res.json({
        message: "Welcome Admin"
    });
};

exports.getAllPatients = async (req, res) => {
    try {
        const patients =
            await User.find({
                role: "PATIENT"
            }).select("-password");

        res.status(200).json(patients);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// exports.adminDashboard = async (req, res) => {
//     res.json({
//         message: "Welcome Admin"
//     });
// };

// exports.getAllPatients = async (req, res) => {
//     try {
//         const patients = await User.find({ role: "PATIENT" }).select("-password");
//         res.status(200).json(patients);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };