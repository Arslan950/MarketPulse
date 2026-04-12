import { body } from "express-validator";

const userRegistrationValidator = () => {
    return [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is required")
            .isLength({ min: 3 })
            .withMessage("Full name must be at least 3 characters long"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),

        body("phoneNumber")
            .trim()
            .notEmpty()
            .withMessage("Phone number is required")
            .isMobilePhone()
            .withMessage("Please provide a valid phone number"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
    ]
};

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
    ]
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),
    ]
};

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 8 })
            .withMessage("New password must be at least 8 characters long"),
    ]
};

const businessSetupValidator = () => {
    return [
        body("businessName")
            .trim()
            .notEmpty()
            .withMessage("Business name is required")
            .isLength({ min: 2, max: 100 })
            .withMessage("Business name must be between 2 and 100 characters"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Business description is required")
            .isLength({ min: 10 })
            .withMessage("Description should be at least 10 characters to be useful for the LLM"),

        body("website")
            .optional({ checkFalsy: true })
            .trim()
            .isURL({ require_protocol: true })
            .withMessage("Website must be a valid URL including http:// or https://"),

        body("profilePicture")
            .optional({ checkFalsy: true })
            .trim()
            .isURL()
            .withMessage("Profile picture must be a valid URL")
    ];
};


export {
    userRegistrationValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    businessSetupValidator
}
