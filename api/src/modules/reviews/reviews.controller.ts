import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import { addReview, deleteReview, getProductReviews } from "./reviews.service";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId, rating, comment } = req.body;
    const review = await addReview(req.user!.userId, productId, rating, comment);
    sendSuccess(res, review, "Review added", 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
    const result = await getProductReviews(req.params.productId!, req);
    sendSuccess(res, result.reviews, "Reviews fetched", 200, result.meta);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    await deleteReview(req.params.id!, req.user!.userId, req.user!.role === "ADMIN");
    sendSuccess(res, null, "Review deleted");
});
