import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { getWishlist, addItem, removeItem } from "./wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/", addItem);
router.delete("/", removeItem);

export default router;
