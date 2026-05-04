import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getDashboardStats, quickSell , cartSell} from "../controllers/sales.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/sell").post(quickSell);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/cart-sell").post(cartSell)

export default router;
