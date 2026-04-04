import { Request, Response } from "express";
import { OrderStatus, prisma } from "@/config/db";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
    createAdminProduct,
    listAdminOrders,
    listAdminProducts,
    updateAdminOrderStatus,
    updateAdminProduct,
    updateProductStock,
} from "./admin.service";
import { uploadProductImages } from "../../utils/imagekit";
import { createError } from "../../middlewares/errorHandler";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await listAdminProducts(req);
    sendSuccess(res, result.products, "Products fetched", 200, result.meta);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];
    const categoryId = req.body.categoryId;
    if (!categoryId) {
        throw createError("categoryId is required", 400);
    }

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true, slug: true },
    });
    if (!category) {
        throw createError("Category not found", 404);
    }

    const images = await uploadProductImages(files, category.slug || category.name);

    const product = await createAdminProduct({
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        categoryId: req.body.categoryId,
        images,
    });

    sendSuccess(res, product, "Product created", 201);
});

export const editProduct = asyncHandler(async (req: Request, res: Response) => {
    const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id! },
        include: { category: true },
    });
    if (!existingProduct) {
        throw createError("Product not found", 404);
    }

    const nextCategoryId = req.body.categoryId || existingProduct.categoryId;
    const nextCategory =
        nextCategoryId === existingProduct.categoryId
            ? existingProduct.category
            : await prisma.category.findUnique({
                where: { id: nextCategoryId },
                select: { id: true, name: true, slug: true },
            });

    if (!nextCategory) {
        throw createError("Category not found", 404);
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const images = await uploadProductImages(files, nextCategory.slug || nextCategory.name);

    const payload: Record<string, unknown> = {};
    const fields = ["name", "slug", "description", "categoryId"] as const;
    for (const field of fields) {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    }

    if (req.body.price !== undefined) {
        payload.price = Number(req.body.price);
    }
    if (req.body.stock !== undefined) {
        payload.stock = Number(req.body.stock);
    }
    if (images.length > 0) {
        payload.images = images;
    }

    const product = await updateAdminProduct(req.params.id!, payload);
    sendSuccess(res, product, "Product updated");
});

export const editStock = asyncHandler(async (req: Request, res: Response) => {
    const product = await updateProductStock(req.params.id!, Number(req.body.stock));
    sendSuccess(res, product, "Stock updated");
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await listAdminOrders(req);
    sendSuccess(res, result.orders, "Orders fetched", 200, result.meta);
});

export const editOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = req.body.status as OrderStatus;
    const order = await updateAdminOrderStatus(req.params.id!, status);
    sendSuccess(res, order, "Order status updated");
});
