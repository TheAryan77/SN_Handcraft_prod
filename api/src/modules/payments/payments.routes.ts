import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { initiatePayment, verifyPayment, fetchPayment } from "./payments.controller";

const router = Router();
router.use(authenticate);

router.post("/orders/:orderId/initiate", initiatePayment);
router.post("/orders/:orderId/verify", verifyPayment);
router.get("/orders/:orderId", fetchPayment);

export default router;
