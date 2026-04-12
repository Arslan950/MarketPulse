import {Router} from "express";
import {verifyToken} from "../middleware/auth.middleware.js";
import {businessSetupValidator} from "../validators/index.js";
import {validation} from "../middleware/validator.middleware.js";
import {
    setBusinessInfo,
    getBusinessInfo,
    editBusinessInfo
} from "../controllers/business.controller.js";

const router = Router();

router.route("/set-info").post(businessSetupValidator(),validation,verifyToken,setBusinessInfo);

router.route("/get-info").get(verifyToken,getBusinessInfo);

router.route("/edit-info").patch(verifyToken,editBusinessInfo)

export default router ;