import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { dashboard, revenueChart } from "./analytics.controller";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", dashboard);
router.get("/revenue", revenueChart);

export default router;
