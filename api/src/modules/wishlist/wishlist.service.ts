import { prisma } from "../../config/db";

export async function getWishlistProductIds(userId: string): Promise<string[]> {
    const items = await prisma.wishlistItem.findMany({
        where: { userId },
        select: { productId: true },
    });
    return items.map((item: { productId: string }) => item.productId);
}

export async function getWishlistWithProducts(userId: string) {
    const items = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return items;
}

export async function addToWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
    });
}

export async function removeFromWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.deleteMany({
        where: { userId, productId },
    });
}
