import { prisma, OrderStatus } from "@/config/db";
import { Request } from "express";
import { createError } from "../../middlewares/errorHandler";
import { getPagination, buildMeta } from "../../utils/pagination";

interface ProductPayload {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images?: string[];
}

export const listAdminProducts = async (req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const { search } = req.query as Record<string, string>;

    const where = search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {};

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            include: { category: true, images: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
    ]);

    return { products, meta: buildMeta(page, limit, total) };
};

export const createAdminProduct = async (payload: ProductPayload) => {
    const existing = await prisma.product.findUnique({ where: { slug: payload.slug } });
    if (existing) {
        throw createError("Product slug already exists", 409);
    }

    const { images, ...rest } = payload;

    return prisma.product.create({
        data: {
            ...rest,
            images: images?.length
                ? {
                    create: images.map((url) => ({ url })),
                }
                : undefined,
        },
        include: { category: true, images: true },
    });
};

export const updateAdminProduct = async (
    id: string,
    payload: Partial<ProductPayload>
) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw createError("Product not found", 404);
    }

    if (payload.slug && payload.slug !== product.slug) {
        const slugTaken = await prisma.product.findUnique({ where: { slug: payload.slug } });
        if (slugTaken) {
            throw createError("Product slug already exists", 409);
        }
    }

    const { images, ...rest } = payload;

    return prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
            where: { id },
            data: rest,
            include: { category: true, images: true },
        });

        if (images && images.length > 0) {
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.productImage.createMany({
                data: images.map((url) => ({ url, productId: id })),
            });
        }

        return tx.product.findUnique({
            where: { id },
            include: { category: true, images: true },
        });
    });
};

export const updateProductStock = async (id: string, stock: number) => {
    if (!Number.isInteger(stock) || stock < 0) {
        throw createError("Stock must be a non-negative integer", 400);
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw createError("Product not found", 404);
    }

    return prisma.product.update({
        where: { id },
        data: { stock },
        include: { category: true, images: true },
    });
};

export const listAdminOrders = async (req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query as Record<string, string>;

    const where = status ? { status: status as OrderStatus } : {};

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { product: true } },
                payment: true,
                shipment: true,
            },
        }),
        prisma.order.count({ where }),
    ]);

    return { orders, meta: buildMeta(page, limit, total) };
};

export const updateAdminOrderStatus = async (id: string, status: OrderStatus) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        throw createError("Order not found", 404);
    }

    return prisma.order.update({
        where: { id },
        data: { status },
        include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
            payment: true,
            shipment: true,
        },
    });
};
