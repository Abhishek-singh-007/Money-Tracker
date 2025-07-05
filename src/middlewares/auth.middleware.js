import jwt from "jsonwebtoken";
import ResponseData from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const authenticateUser = asyncHandler(async (req, res, next) => {
    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return ResponseData(res, {
                statusCode: 401,
                status: "error",
                message: "Unauthorized, token not provided",
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'Strict' });
                res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'Strict' });
                return ResponseData(res, {
                    statusCode: 401,
                    status: "error",
                    message: "Please login again.",
                });
            }
            req.user = user;
            next();
        })
    } catch (error) {
        return ResponseData(res, {
            statusCode: 500,
            status: "error",
            message: "Internal server error",
        });
    }
});

export default authenticateUser;
