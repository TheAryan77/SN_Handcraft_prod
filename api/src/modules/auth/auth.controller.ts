import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { loginService, refreshTokenService, registerService } from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const result = await registerService(name, email, password);
    sendSuccess(res, result, "Registration successful", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    sendSuccess(res, result, "Login successful");
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await refreshTokenService(refreshToken);
    sendSuccess(res, result, "Token refreshed");
});
