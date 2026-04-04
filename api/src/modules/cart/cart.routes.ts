import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { fetchCart, addItem, updateItem, removeItem, emptyCart } from "./cart.controller";

const router = Router();

router.use(authenticate);

router.get("/", fetchCart);
router.post("/items", addItem);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);
router.delete("/", emptyCart);

export default router;
