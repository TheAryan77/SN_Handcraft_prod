import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { list, create, validate, remove } from "./coupons.controller";

const router = Router();

router.get("/validate/:code", authenticate, validate); // customers validate before checkout
router.get("/", authenticate, authorize("ADMIN"), list);
router.post("/", authenticate, authorize("ADMIN"), create);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
