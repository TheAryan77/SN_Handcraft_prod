import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import {
    addAddress, changePassword, deleteAddress,
    getProfile, listUsers, updateProfile,
} from "./users.service";

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getProfile(req.user!.userId);
    sendSuccess(res, user);
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, "Profile updated");
});

export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    await changePassword(req.user!.userId, oldPassword, newPassword);
    sendSuccess(res, null, "Password updated successfully");
});

export const addUserAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const address = await addAddress(req.user!.userId, req.body);
    sendSuccess(res, address, "Address added", 201);
});

export const removeUserAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
    await deleteAddress(req.user!.userId, req.params.id!);
    sendSuccess(res, null, "Address removed");
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await listUsers(req);
    sendSuccess(res, result.users, "Users fetched", 200, result.meta);
});
