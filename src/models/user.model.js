import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        accessToken: {
            type: String,
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}

userSchema.methods.generateVerificationToken = async function () {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.VERIFICATION_TOKEN_SECRET, { expiresIn: process.env.VERIFICATION_TOKEN_EXPIRY })
}

userSchema.methods.resetToken = async function () {
    return jwt.sign({ _id: this._id }, process.env.RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_TOKEN_EXPIRY })
}

export const User = mongoose.model("User", userSchema);