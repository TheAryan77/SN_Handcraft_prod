import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { upload } from "../../utils/upload";
import {
    createProduct,
    editOrderStatus,
    editProduct,
    editStock,
    getOrders,
    getProducts,
} from "./admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/products", getProducts);
router.post("/products", upload.array("images", 5), createProduct);
router.patch("/products/:id", upload.array("images", 5), editProduct);
router.patch("/products/:id/stock", editStock);

router.get("/orders", getOrders);
router.patch("/orders/:id/status", editOrderStatus);

export default router;
