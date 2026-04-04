import { Router } from "express";
import { register, login, refreshToken } from "./auth.controller";
import { registerValidator, loginValidator, refreshTokenValidator } from "./auth.validator";
import { validate } from "../../middlewares/validate";
import { authRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, registerValidator, validate, register);
router.post("/login", authRateLimiter, loginValidator, validate, login);
router.post("/refresh", refreshTokenValidator, validate, refreshToken);

export default router;
