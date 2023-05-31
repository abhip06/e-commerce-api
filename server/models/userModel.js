const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please Enter your Name"],
        maxLenght: [30, "Name cannot exceed 30 characters."],
        minLenght: [4, "Name should have atleast 4 characters."]
    },
    email: {
        type: String,
        required: [true, "Please Enter your Email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid email."]
    },
    password: {
        type: String,
        required: [true, "Please Enter your Password"],
        minLenght: [8, "Password should be greater than 8 characters."],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});


// Encrypting password using bcryptjs
userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});


// JWT Token
userSchema.methods.getJWTToken = function() {

    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    });

    return token;
}


// Comparing Hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password);
}


// Generating Password reset Token
userSchema.methods.getResetPasswordToken = async function() {

    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding reset Password Token to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("users", userSchema);