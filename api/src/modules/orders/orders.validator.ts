import { body } from "express-validator";

export const placeOrderValidator = [
    body("addressId").notEmpty().withMessage("Delivery address is required"),
    body("items").optional().isArray().withMessage("Items must satisfy array format"),
    body("items.*.productId").optional().notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("couponCode").optional().isString(),
];
