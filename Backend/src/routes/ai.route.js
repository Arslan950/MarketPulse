import {Router} from  "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { clearCopilotHistory , businessCopilot } from "../controllers/ai.controller.js";

const router = Router();

router.route("/copilot").post(verifyToken,businessCopilot);

router.route("/new-chat").get(verifyToken,clearCopilotHistory);

export default router;