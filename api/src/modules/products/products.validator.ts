import { body, query } from "express-validator";

export const createProductValidator = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number").toFloat(),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),
    body("categoryId").notEmpty().withMessage("Category ID is required"),
];

export const updateProductValidator = [
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number").toFloat(),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),
];

export const productQueryValidator = [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
];
