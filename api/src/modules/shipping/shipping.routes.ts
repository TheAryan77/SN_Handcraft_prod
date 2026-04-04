import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { ship, track } from "./shipping.controller";

const router = Router();
router.use(authenticate);

router.post("/orders/:orderId/ship", authorize("ADMIN"), ship);
router.get("/orders/:orderId/track", track);

export default router;
