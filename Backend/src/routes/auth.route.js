import {Router} from  "express"
import {registerUser ,login , logout , getUserInfo , verifyEmail, getEmailVerificationStatus , resendEmailverification} from "../controllers/auth.controller.js"
import { validation } from "../middleware/validator.middleware.js";
import { userRegistrationValidator, userLoginValidator} from "../validators/index.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegistrationValidator(),validation,registerUser);
router.route("/login").post(userLoginValidator(),validation,login);
//secured
router.route("/logout").post(verifyToken,logout);
router.route("/current-user").get(verifyToken , getUserInfo)

router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/verification-status/:userId").get(getEmailVerificationStatus);

router.route("/resend-email-verification").post(verifyToken, resendEmailverification);

export default router ;
