import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { getAll, getBySlug, create, update, remove } from "./categories.controller";

const router = Router();

router.get("/", getAll);
router.get("/:slug", getBySlug);

// Admin only mutations
router.post("/", authenticate, authorize("ADMIN"), create);
router.patch("/:id", authenticate, authorize("ADMIN"), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
