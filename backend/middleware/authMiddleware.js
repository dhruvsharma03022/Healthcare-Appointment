const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = await User.findById(decoded.id)
                .select("-password");

            next();
        } else {
            return res.status(401).json({
                message: "No token provided"
            });
        }

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};


const authorize = (...roles) => {
    return (req, res, next) => {

        console.log("================================");
        console.log("AUTHORIZATION CHECK");
        console.log("User role:", req.user.role);
        console.log("Allowed roles:", roles);
        console.log("Request:", req.method, req.originalUrl);
        console.log("================================");

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};
module.exports = {
    protect,
    authorize
};