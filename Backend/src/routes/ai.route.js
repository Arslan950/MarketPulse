import {Router} from  "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { businessCopilot } from "../controllers/ai.controller.js";

const router = Router();

router.route("/copilot").post(verifyToken,businessCopilot);

export default router;