import { prisma } from "@/config/db";
import { Request } from "express";
import { createError } from "../../middlewares/errorHandler";
import { getPagination, buildMeta } from "../../utils/pagination";

export const listProducts = async (req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const { categoryId, search, minPrice, maxPrice, inStock } = req.query as Record<string, string>;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (inStock === "true") where.stock = { gt: 0 };

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where, skip, take: limit,
            include: { category: true, images: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
    ]);
    return { products, meta: buildMeta(page, limit, total) };
};

export const getProductBySlug = async (slug: string) => {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true, images: true, reviews: { include: { user: { select: { name: true } } } } },
    });
    if (!product) throw createError("Product not found", 404);
    return product;
};

export const createProduct = async (data: {
    name: string; slug: string; description: string;
    price: number; stock: number; categoryId: string; images?: string[];
}) => {
    const { images, ...rest } = data;
    return prisma.product.create({
        data: {
            ...rest,
            images: images ? { create: images.map((url) => ({ url })) } : undefined,
        },
        include: { images: true, category: true },
    });
};

export const updateProduct = async (id: string, data: Partial<{
    name: string; description: string; price: number; stock: number; categoryId: string;
}>) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw createError("Product not found", 404);
    return prisma.product.update({ where: { id }, data, include: { images: true } });
};

export const deleteProduct = async (id: string) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw createError("Product not found", 404);
    return prisma.product.delete({ where: { id } });
};
