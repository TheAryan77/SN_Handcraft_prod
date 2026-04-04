import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from "./cart.service";

export const fetchCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cart = await getCart(req.user!.userId);
    sendSuccess(res, cart);
});

export const addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId, quantity = 1 } = req.body;
    const item = await addToCart(req.user!.userId, productId, quantity);
    sendSuccess(res, item, "Item added to cart", 201);
});

export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await updateCartItem(req.user!.userId, req.params.itemId!, req.body.quantity);
    sendSuccess(res, item, "Cart item updated");
});

export const removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    await removeFromCart(req.user!.userId, req.params.itemId!);
    sendSuccess(res, null, "Item removed from cart");
});

export const emptyCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    await clearCart(req.user!.userId);
    sendSuccess(res, null, "Cart cleared");
});
