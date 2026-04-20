import {Router} from  "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { clearCopilotHistory , businessCopilot , priceSuggestion, trendingItemsSuggestion } from "../controllers/ai.controller.js";

const router = Router();

router.route("/copilot").post(verifyToken,businessCopilot);

router.route("/new-chat").get(verifyToken,clearCopilotHistory);

router.route("/price-suggestion").post(verifyToken,priceSuggestion);

router.route("/trend-suggestion").get(verifyToken,trendingItemsSuggestion);

export default router;