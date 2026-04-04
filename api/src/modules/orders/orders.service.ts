import { prisma, Prisma, Product, OrderStatus } from "@/config/db";
import { Request } from "express";
import { createError } from "../../middlewares/errorHandler";
import { getPagination, buildMeta } from "../../utils/pagination";
import { eventEmitter } from "../../events";

interface OrderItem {
    productId: string;
    quantity: number;
}

export const placeOrder = async (
    userId: string,
    addressId: string,
    items?: OrderItem[],
    couponCode?: string
) => {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw createError("Address not found", 404);

    let orderItems = items || [];
    let isFromCart = false;

    if (orderItems.length === 0) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });
        if (!cart || cart.items.length === 0) {
            throw createError("Cart is empty and no items were provided", 400);
        }
        orderItems = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
        isFromCart = true;
    }

    const productIds = orderItems.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== orderItems.length) throw createError("One or more products not found", 400);

    for (const item of orderItems) {
        const product = products.find((p: Product) => p.id === item.productId)!;
        if (product.stock < item.quantity)
            throw createError(`Insufficient stock for "${product.name}"`, 400);
    }

    let totalAmount = orderItems.reduce((sum, item) => {
        const product = products.find((p: Product) => p.id === item.productId)!;
        return sum + product.price * item.quantity;
    }, 0);

    if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
        if (coupon && coupon.expiryDate > new Date()) {
            totalAmount = totalAmount - (totalAmount * coupon.discount) / 100;
        }
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const createdOrder = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: "PLACED",
                paymentStatus: "PENDING",
                items: {
                    create: orderItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: products.find((p: Product) => p.id === item.productId)!.price,
                    })),
                },
            },
            include: { items: true },
        });

        for (const item of orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        if (isFromCart) {
            await tx.cartItem.deleteMany({
                where: { cart: { userId } }
            });
        }

        return createdOrder;
    });

    // Emit event for background jobs (email, inventory, etc)
    eventEmitter.emit("order.placed", order);

    return order;
};

export const getUserOrders = async (userId: string, req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where: { userId },
            skip, take: limit,
            include: { items: { include: { product: true } }, shipment: true, payment: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where: { userId } }),
    ]);
    return { orders, meta: buildMeta(page, limit, total) };
};

export const getOrderById = async (id: string, userId?: string) => {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) (where as Record<string, unknown>).userId = userId;
    const order = await prisma.order.findFirst({
        where,
        include: {
            items: { include: { product: { include: { images: true } } } },
            payment: true,
            shipment: true,
            user: { select: { name: true, email: true } },
        },
    });
    if (!order) throw createError("Order not found", 404);
    return order;
};

export const cancelOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw createError("Order not found", 404);
    if (!["PLACED", "CONFIRMED"].includes(order.status))
        throw createError("Order cannot be cancelled at this stage", 400);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
            include: { items: true },
        });
        for (const item of updated.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }
        return updated;
    });
};

export const listAllOrders = async (req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query as Record<string, string>;
    const where = status ? { status: status as OrderStatus } : {};
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip, take: limit,
            include: { user: { select: { name: true, email: true } }, items: true, shipment: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where }),
    ]);
    return { orders, meta: buildMeta(page, limit, total) };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError("Order not found", 404);
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
    });

    eventEmitter.emit("order.status.updated", { orderId, status: updatedOrder.status });

    return updatedOrder;
};
