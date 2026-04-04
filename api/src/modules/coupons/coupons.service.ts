import { prisma } from "@/config/db";
import { createError } from "../../middlewares/errorHandler";

export const listCoupons = async () =>
    prisma.coupon.findMany({ orderBy: { expiryDate: "asc" } });

export const createCoupon = async (data: {
    code: string; discount: number; expiryDate: Date;
}) => {
    const exists = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (exists) throw createError("Coupon code already exists", 409);
    return prisma.coupon.create({ data });
};

export const validateCoupon = async (code: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw createError("Invalid coupon code", 404);
    if (coupon.expiryDate < new Date()) throw createError("Coupon has expired", 400);
    return coupon;
};

export const deleteCoupon = async (id: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw createError("Coupon not found", 404);
    return prisma.coupon.delete({ where: { id } });
};
