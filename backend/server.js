const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes =
require("./routes/doctorRoutes");
require("dotenv").config();

const app = express();
const connectDB = require("./config/db");
const adminRoutes =
require("./routes/adminRoutes");
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.get("/", (req, res) => {
    res.send("Healthcare API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});