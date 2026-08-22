const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const resend = new Resend(process.env.RESEND_API_KEY);

exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone
        } = req.body;

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long"
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one uppercase letter"
            });
        }

        if (!/[a-z]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one lowercase letter"
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one number"
            });
        }

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

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Don't reveal whether an email exists
        if (!user) {
            return res.status(200).json({
                message:
                    "If an account exists with this email, a password reset link has been sent."
            });
        }

        console.log("USER FOUND");

        // Generate random token
        const resetToken =
            crypto.randomBytes(32).toString("hex");

        // Store token in database
        user.resetPasswordToken = resetToken;

        // Token valid for 15 minutes
        user.resetPasswordExpires =
            Date.now() + 15 * 60 * 1000;

        await user.save();

        console.log("USER SAVED");

        const resetLink =
            `https://healthcare-appointment-nine.vercel.app/reset-password/${resetToken}`;

        console.log("ABOUT TO SEND EMAIL");

        const { data, error } = await resend.emails.send({
            from: "Healthcare Manager <onboarding@resend.dev>",
            to: [user.email],
            subject: "Healthcare Manager - Password Reset",
            html: `
                <h2>Password Reset</h2>

                <p>
                    You requested a password reset
                    for your Healthcare Manager account.
                </p>

                <p>
                    Click the button below to reset
                    your password:
                </p>

                <a
                    href="${resetLink}"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:5px;
                    "
                >
                    Reset Password
                </a>

                <p>
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request this,
                    you can ignore this email.
                </p>
            `
        });

        if (error) {
            console.error("RESEND ERROR:", error);

            return res.status(500).json({
                message:
                    "Unable to send password reset email"
            });
        }

        console.log("EMAIL SENT:", data.id);

        res.status(200).json({
            message:
                "If an account exists with this email, a password reset link has been sent."
        });

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Unable to process password reset request"
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long"
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one uppercase letter"
            });
        }

        if (!/[a-z]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one lowercase letter"
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least one number"
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                message:
                    "Password reset link is invalid or expired"
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        // Invalidate token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            message:
                "Password reset successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Unable to reset password"
        });
    }
};