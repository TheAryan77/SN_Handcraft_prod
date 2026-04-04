import { prisma } from "@/config/db";
import { createError } from "../../middlewares/errorHandler";

export const listCategories = async () =>
    prisma.category.findMany({ orderBy: { name: "asc" } });

export const getCategoryBySlug = async (slug: string) => {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) throw createError("Category not found", 404);
    return cat;
};

export const createCategory = async (name: string, slug: string) => {
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) throw createError("Category slug already exists", 409);
    return prisma.category.create({ data: { name, slug } });
};

export const updateCategory = async (id: string, data: { name?: string; slug?: string }) => {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw createError("Category not found", 404);
    return prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id: string) => {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw createError("Category not found", 404);
    return prisma.category.delete({ where: { id } });
};
