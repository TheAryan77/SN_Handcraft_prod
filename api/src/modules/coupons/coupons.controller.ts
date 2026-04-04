import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { createCoupon, deleteCoupon, listCoupons, validateCoupon } from "./coupons.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await listCoupons();
    sendSuccess(res, coupons);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await createCoupon({
        ...req.body,
        expiryDate: new Date(req.body.expiryDate),
    });
    sendSuccess(res, coupon, "Coupon created", 201);
});

export const validate = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await validateCoupon(req.params.code!);
    sendSuccess(res, coupon, "Coupon is valid");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await deleteCoupon(req.params.id!);
    sendSuccess(res, null, "Coupon deleted");
});
