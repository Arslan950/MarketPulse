import {Router} from  "express"
import {registerUser , setBasicInfo , login , logout , getUserInfo , verifyEmail, getEmailVerificationStatus , resendEmailverification , forgotPassword , resetForgotPassword} from "../controllers/auth.controller.js"
import { validation } from "../middleware/validator.middleware.js";
import { userRegistrationValidator, userLoginValidator , userForgotPasswordValidator , userResetForgotPasswordValidator} from "../validators/index.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();
//unsecured
router.route("/register").post(userRegistrationValidator(),validation,registerUser);

router.route("/set-basic-info/:userID").post(setBasicInfo);

router.route("/login").post(userLoginValidator(),validation,login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/verification-status/:userId").get(getEmailVerificationStatus);

router.route("/forgot-password").post(userForgotPasswordValidator(),validation,forgotPassword);

router.route("/reset-password/:resetPasswordToken").post(userResetForgotPasswordValidator(),validation,resetForgotPassword);

//secured
router.route("/logout").post(verifyToken,logout);

router.route("/current-user").get(verifyToken , getUserInfo);

router.route("/resend-email-verification").post(verifyToken, resendEmailverification);

export default router ;
