import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { sendEmail, emailVerificationMail, resetPasswordMail } from "../utils/mail.js"
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Unable to create JWT Tokens")
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, fullName, phoneNumber } = req.body;

    const userExist = await User.findOne({
        $or: [{ fullName }, { email }]
    })

    if (userExist) {
        throw new ApiError(409, "User with same name or email already exists");
    }

    const user = await User.create({
        email,
        fullName,
        password,
        phoneNumber,
        isEmailVerified: false
    });

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify yourself a valid user!",
            mailgenContent: emailVerificationMail(
                user?.fullName,
                `http://localhost:5173/verify-email/${unHashedToken}`
            ),
        }
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpires",
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating a user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, { user: createdUser }, "user created successfully , A verification email has been sent to your email")
        )
});

const setBasicInfo = asyncHandler(async (req,res) => {
    const { businessName , description , websiteURL , profilePictureURL } = req.body ;
    const {userID} = req.params ;

    const user = await User.findById(userID).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpires",
    )

    if(!user){
        throw new ApiError(449,"User do not exist in database");
    }

    user.profilePicture = profilePictureURL;
    user.businessInfo.businessName = businessName ;
    user.businessInfo.description = description ;
    user.businessInfo.websiteURL = websiteURL ;

    await user.save({validateBeforeSave : false});

    return res
        .status(200)
        .json(
            new ApiResponse(200,{user},"User Basic info setted succesfully")
        )

});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required for login");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User does not exists");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect password !");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpires",
    )

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in succesfully")
        )

});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            returnDocument : "after"
        }
    );
    const options = {
        httpOnly: true,
        secure: false,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "Logged out succesfully")
        )
});

const getUserInfo = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, { "data": req.user }, "Fetched User data")
        )
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Missing Email verification token");
    }

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Token is either expired or invalid");
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email is verified",
            )
        )
});

const getEmailVerificationStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId).select("_id isEmailVerified");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    userId: user._id,
                    isEmailVerified: user.isEmailVerified,
                },
                "Email verification status fetched",
            )
        )
});

const resendEmailverification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "No user found");
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "Already verify");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify yourself a valid user!",
            mailgenContent: emailVerificationMail(
                user?.fullName,
                `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`
            ),
        }
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Mail has been re-sent to your email ID",
            )
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .status(200)
            .clearCookie("accessToken", accessToken, options)
            .clearCookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken, refreshToken: newRefreshToken
                }, "Access Token refreshed")
            )

    } catch (error) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(439, "Email entered do not exist");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "Click below to change your password",
            mailgenContent: resetPasswordMail(
                user?.fullName,
                `http://localhost:5173/reset-password/${unHashedToken}`
            ),
        }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(201, {}, "reset password mail has been sent to you mail ID")
        )

});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { newPassword } = req.body;

    if (!resetPasswordToken) {
        throw new ApiError(450, "Token not found")
    };

    let hashedToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(449, "Either the token is inavlid or expired")
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(
            new ApiResponse(201, "your password is sucessfully changed")
        )

});

export {
    registerUser,
    setBasicInfo,
    login,
    logout,
    getUserInfo,
    verifyEmail,
    getEmailVerificationStatus,
    resendEmailverification,
    refreshAccessToken,
    forgotPassword,
    resetForgotPassword
};
