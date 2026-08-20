const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = generateToken(
            user._id,
            user.role
        );

       const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
};

res.status(201).json({
    token,
    user: userResponse
});
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = generateToken(
            user._id,
            user.role
        );

        const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
};

res.status(201).json({
    token,
    user: userResponse
});

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};