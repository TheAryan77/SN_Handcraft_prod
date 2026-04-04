import { prisma } from "@/config/db";
import { createError } from "../../middlewares/errorHandler";

export const getCart = async (userId: string) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { include: { images: true } },
                },
            },
        },
    });
    // Auto-create cart if not found
    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: { items: { include: { product: { include: { images: true } } } } },
        });
    }
    return cart;
};

export const addToCart = async (userId: string, productId: string, quantity: number) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError("Product not found", 404);
    if (product.stock < quantity) throw createError(`Only ${product.stock} items in stock`, 400);

    const cart = await getCart(userId);

    const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });

    if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.stock < newQty) throw createError(`Only ${product.stock} items in stock`, 400);
        return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    }

    return prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
    const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cart: { userId } },
        include: { product: true },
    });
    if (!item) throw createError("Cart item not found", 404);
    if (item.product.stock < quantity) throw createError(`Only ${item.product.stock} in stock`, 400);
    return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
};

export const removeFromCart = async (userId: string, itemId: string) => {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
    if (!item) throw createError("Cart item not found", 404);
    return prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};
