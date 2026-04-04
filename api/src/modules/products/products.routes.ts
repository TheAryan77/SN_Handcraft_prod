import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { getAll, getBySlug, create, update, remove } from "./products.controller";
import { createProductValidator, productQueryValidator, updateProductValidator } from "./products.validator";
import { upload } from "../../utils/upload";

const router = Router();

router.get("/", productQueryValidator, validate, getAll);
router.get("/:slug", getBySlug);

router.post("/", authenticate, authorize("ADMIN"), upload.array("images", 5), createProductValidator, validate, create);
router.patch("/:id", authenticate, authorize("ADMIN"), updateProductValidator, validate, update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
