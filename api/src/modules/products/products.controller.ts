import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
    createProduct, deleteProduct, getProductBySlug,
    listProducts, updateProduct,
} from "./products.service";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await listProducts(req);
    sendSuccess(res, result.products, "Products fetched", 200, result.meta);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await getProductBySlug(req.params.slug!);
    sendSuccess(res, product);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
    // If files were uploaded via multer, add their paths to req.body.images
    if (req.files && Array.isArray(req.files)) {
        const fileUrls = (req.files as Express.Multer.File[]).map(
            (file) => `/uploads/${file.filename}`
        );
        req.body.images = fileUrls;
    }
    const product = await createProduct(req.body);
    sendSuccess(res, product, "Product created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const product = await updateProduct(req.params.id!, req.body);
    sendSuccess(res, product, "Product updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await deleteProduct(req.params.id!);
    sendSuccess(res, null, "Product deleted");
});
