const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server error.";

    // Wrong mongodb id error
    if (err.name === "CastError") {
        const message = `Source not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.code === "JsonWebTokenError") {
        const message = `JSON Web Token is invalid, please try again.`;
        err = new ErrorHandler(message, 400);
    }

    // JWT Expired error
    if (err.code === "TokenExpiredError") {
        const message = `Session Expired, please try again.`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({ success: false, message: err.message });
};