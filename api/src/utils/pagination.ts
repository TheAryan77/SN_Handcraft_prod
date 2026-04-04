import { Request } from "express";

export interface PaginationMeta extends Record<string, unknown> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const getPagination = (req: Request) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const buildMeta = (page: number, limit: number, total: number): PaginationMeta => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});
