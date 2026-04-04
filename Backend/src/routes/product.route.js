import {Router} from  "express"
import { verifyToken } from "../middleware/auth.middleware.js";
import { addProduct , getProducts , removeProduct , updateProductInfo} from "../controllers/product.controller.js";
const router = Router();

router.route("/add-product").post(verifyToken,addProduct);

router.route("/products-list").get(verifyToken,getProducts);

router.route("/remove-product/:productID").delete(verifyToken,removeProduct);

router.route("/update-product/:productId").patch(verifyToken,updateProductInfo);

export default router ;
