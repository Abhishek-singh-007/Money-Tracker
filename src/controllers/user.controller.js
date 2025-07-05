import { response } from "express";
import { User } from "../models/user.model.js";
import ResponseData from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/Email.js";
import jwt from 'jsonwebtoken';

export const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const existUser = await User.findOne({
        $or: [{ email }]
    })

    if (existUser) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Email already exists",
        })
    }

    const user = await User.create({ ...req.body });

    const verificationToken = await user.generateVerificationToken();

    const verificationLink = `${process.env.USER_URL}/verify-email/${verificationToken}`;

    const subject = "Email Verification - Budget Tracker App";
    const message = `
        <h1>Email Verification</h1>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" target="_blank">Verify Email</a>
        <p>If you didn't sign up for the Budget Tracker app, please ignore this email. Otherwise, you can continue using your email address to log in.</p>
        <p>This link is valid for 24 hours.</p>
    `;

    await sendEmail(user.email, subject, message);

    return ResponseData(res, {
        statusCode: 201,
        data: user,
        message: "Please check your email to verify your account.",
    });
})

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();

        user.refreshToken = refreshToken;
        user.accessToken = accessToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return ResponseData(response, {
            statusCode: 500,
            message: "Error generating tokens",
        })
    }
}

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Please register your account",
        })
    }

    if (!user.verified) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Please verify your email",
        })
    }

    if (!user || !(await user.verifyPassword(password))) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Invalid email or password",
        })
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000,
        sameSite: "Strict",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "Strict",
    });

    const loginDatails = await User.findOne({ email });

    return ResponseData(res, {
        statusCode: 200,
        data: loginDatails,
        message: "User logged in successfully",
    });

})

export const logoutUser = asyncHandler(async (req, res) => {


    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'Strict' });

    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: null } },
            { new: true }
        )
    }

    return ResponseData(res, {
        statusCode: 200,
        message: "User logged out successfully",
    });
})

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Invalid verification token",
        });
    }

    try {
        const decode = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);

        const user = await User.findByIdAndUpdate(
            decode._id,
            { $set: { verified: true } },
            { new: true }
        );

        if (!user) {
            return ResponseData(res, {
                statusCode: 400,
                message: "User not found",
            });
        }

        if (!user.verified) {
            return ResponseData(res, {
                statusCode: 200,
                message: "Please verify your email",
            });
        }

        return ResponseData(res, {
            statusCode: 200,
            message: "Email verified successfully",
        });
    } catch (error) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Invalid or expired token",
        });
    }
})

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return ResponseData(res, {
                statusCode: 400,
                message: "No account found with that email address.",
            });
        }

        const resetToken = await user.resetToken();

        const resetURL = `${process.env.USER_URL}/reset-password/${resetToken}`;

        const subject = "Password Reset - Budget Tracker App";
        const message = `
            <h1>Password Reset</h1>
            <p>You requested to reset your password. Please click the link below to reset it:</p>
            <a href="${resetURL}" target="_blank">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>This link is valid for 15 minutes.</p>
        `;

        await sendEmail(user.email, subject, message);
        return ResponseData(res, {
            statusCode: 200,
            message: "Please check your email to reset your password.",
        });
    } catch (error) {
        return ResponseData(res, {
            statusCode: 500,
            message: "Internal server error",
        });
    }
})

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decode = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

        const user = await User.findById(decode._id);
        if (!user) {
            return ResponseData(res, {
                statusCode: 400,
                message: "No account found with that email address.",
            });
        }

        user.password = password;
        await user.save();

        return ResponseData(res, {
            statusCode: 200,
            message: "Password reset successfully",
        });
    } catch (error) {
        return ResponseData(res, {
            statusCode: 400,
            message: "Invalid or expired token",
        });
    }
})