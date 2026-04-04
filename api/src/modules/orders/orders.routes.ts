import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { placeOrderValidator } from "./orders.validator";
import { allOrders, cancel, getOne, myOrders, place, updateStatus } from "./orders.controller";

const router = Router();

router.use(authenticate);

// Customer
router.post("/", placeOrderValidator, validate, place);
router.get("/my", myOrders);
router.get("/:id", getOne);
router.patch("/:id/cancel", cancel);

// Admin
router.get("/", authorize("ADMIN"), allOrders);
router.patch("/:id/status", authorize("ADMIN"), updateStatus);

export default router;
