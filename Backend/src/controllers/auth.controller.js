import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { sendEmail, emailVerificationMail } from "../utils/mail.js"

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

    const {unHashedToken , hashedToken , tokenExpiry} = user.generateTemporaryToken();

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

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpires",
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating a user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201,{user : createdUser} , "user created successfully , A verification email has been sent to your email")
        )
});

export {registerUser} ;