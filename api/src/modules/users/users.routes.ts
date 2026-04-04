import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
    addUserAddress, getAllUsers, getMe,
    removeUserAddress, updateMe, updatePassword,
} from "./users.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", updatePassword);
router.post("/me/addresses", addUserAddress);
router.delete("/me/addresses/:id", removeUserAddress);

// Admin only
router.get("/", authorize("ADMIN"), getAllUsers);

export default router;
