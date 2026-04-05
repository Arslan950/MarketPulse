import {Router} from  "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { addItems,getItems,updateAfterBuy } from "../controllers/procurement.controller.js";

const router = Router();

router.route("/get-catalog").get(verifyToken,getItems);

router.route("/add-item").post(verifyToken,addItems);

router.route("/buy/:itemID").post(verifyToken,updateAfterBuy);

export default router ;