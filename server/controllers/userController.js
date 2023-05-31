const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');

const User = require('../models/userModel');
const sendToken = require('../utils/sendJWTToken');


// =========== USER AUTHENTICATION ===========

// Register user
exports.registerUser = catchAsyncError(async (req, res, next) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "this is sample public id",
            url: "profilepicurl"
        }
    });

    sendToken(user, 201, res);

});

// Login user
exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    // Checking if user has given email and password both.
    if (!email || !password) {
        return next(new ErrorHandler("Please enter Email & password.", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 401));
    }

    sendToken(user, 200, res);

});

// Logout User
exports.logoutUser = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({ success: true, message: "Logged Out successfully." });
});

// Forgot password
exports.forgotPassword = catchAsyncError(async(req, res, next) => {

    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    // Get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is : \n ${resetPasswordUrl}. \n\nIf you have not requested password change then, please ignore it.\n\nAnd do not share this token with anyone.`;

    try {

        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery.",
            message,
        });

        res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully.` });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncError(async(req, res, next) => {

    // Creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired.", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match.", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    sendToken(user, 200, res);    
});


// =========== USER DETAILS ===========

// Get user detail
exports.getUserDetails = catchAsyncError(async(req, res, next) => {
    
    const user = await User.findById(req.user.id);

    res.status(200).json({success: true, user,});
});

// Update user Password
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Your old password is incorrect.", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match.", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({ success: true, });
});



// =========== ADMIN ROLES ===========

// Get all users ---> Admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({success: true, users, });
});

// Get single users ---> Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 400));
    }

    res.status(200).json({success: true, user, });
});

// Update user Role ---> Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req. body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({ success: true, message: `Role for ${user.name} updated successfully.` });
});

// Delete user ---> Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 400));
    }

    await user.remove();

    res.status(200).json({ success: true, message: "User deleted successfully."});
});