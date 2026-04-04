import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { create, list, remove } from "./reviews.controller";

const router = Router();

router.get("/products/:productId", list);
router.post("/", authenticate, create);
router.delete("/:id", authenticate, remove);

export default router;
