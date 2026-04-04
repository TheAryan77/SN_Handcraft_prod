import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import { getWishlistWithProducts, addToWishlist, removeFromWishlist } from "./wishlist.service";

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const items = await getWishlistWithProducts(req.user!.userId);
    sendSuccess(res, items);
});

export const addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;
    if (!productId) {
        res.status(400).json({ success: false, message: "productId is required" });
        return;
    }
    await addToWishlist(req.user!.userId, productId);
    sendSuccess(res, null, "Added to wishlist", 201);
});

export const removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;
    if (!productId) {
        res.status(400).json({ success: false, message: "productId is required" });
        return;
    }
    await removeFromWishlist(req.user!.userId, productId);
    sendSuccess(res, null, "Removed from wishlist");
});
