import { prisma } from "@/config/db";
import { createError } from "../../middlewares/errorHandler";
import { getPagination, buildMeta } from "../../utils/pagination";
import { Request } from "express";

export const addReview = async (
    userId: string, productId: string, rating: number, comment?: string
) => {
    const exists = await prisma.review.findFirst({ where: { userId, productId } });
    if (exists) throw createError("You have already reviewed this product", 409);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError("Product not found", 404);

    return prisma.review.create({
        data: { userId, productId, rating, comment },
        include: { user: { select: { name: true } } },
    });
};

export const getProductReviews = async (productId: string, req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { productId },
            skip, take: limit,
            include: { user: { select: { name: true } } },
            orderBy: { id: "desc" },
        }),
        prisma.review.count({ where: { productId } }),
    ]);
    return { reviews, meta: buildMeta(page, limit, total) };
};

export const deleteReview = async (reviewId: string, userId: string, isAdmin: boolean) => {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw createError("Review not found", 404);
    if (!isAdmin && review.userId !== userId) throw createError("Unauthorized", 403);
    return prisma.review.delete({ where: { id: reviewId } });
};
