import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
    createCategory, deleteCategory, getCategoryBySlug,
    listCategories, updateCategory,
} from "./categories.service";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
    const cats = await listCategories();
    sendSuccess(res, cats);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const cat = await getCategoryBySlug(req.params.slug!);
    sendSuccess(res, cat);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
    const cat = await createCategory(req.body.name, req.body.slug);
    sendSuccess(res, cat, "Category created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const cat = await updateCategory(req.params.id!, req.body);
    sendSuccess(res, cat, "Category updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await deleteCategory(req.params.id!);
    sendSuccess(res, null, "Category deleted");
});
