import { prisma } from "@/config/db";
import bcrypt from "bcryptjs";
import { createError } from "../../middlewares/errorHandler";
import { getPagination, buildMeta } from "../../utils/pagination";
import { Request } from "express";

export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, name: true, email: true, role: true, createdAt: true,
            addresses: true,
        },
    });
    if (!user) throw createError("User not found", 404);
    return user;
};

export const updateProfile = async (userId: string, data: { name?: string; email?: string }) => {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, email: true, role: true },
    });
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw createError("User not found", 404);
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw createError("Current password is incorrect", 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

export const addAddress = async (userId: string, addressData: object) => {
    return prisma.address.create({ data: { userId, ...addressData as any } });
};

export const deleteAddress = async (userId: string, addressId: string) => {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw createError("Address not found", 404);
    return prisma.address.delete({ where: { id: addressId } });
};

// Admin: list all users
export const listUsers = async (req: Request) => {
    const { page, limit, skip } = getPagination(req);
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip, take: limit,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
    ]);
    return { users, meta: buildMeta(page, limit, total) };
};
