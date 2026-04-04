import bcrypt from "bcryptjs";
import { prisma } from "@/config/db";
import { createError } from "../../middlewares/errorHandler";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/token";

export const registerService = async (name: string, email: string, password: string) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw createError("Email already in use", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { name, email, password: hashed },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    return { user, accessToken, refreshToken };
};

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createError("Invalid email or password", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw createError("Invalid email or password", 401);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw createError("User no longer exists", 401);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    return { accessToken };
};
