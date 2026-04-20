import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getDashboardStats, quickSell } from "../controllers/sales.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/sell").post(quickSell);
router.route("/dashboard-stats").get(getDashboardStats);

export default router;
