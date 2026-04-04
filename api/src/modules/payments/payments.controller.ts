import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import { createRazorpayOrder, getPaymentForOrder, verifyAndRecordPayment } from "./payments.service";

export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await createRazorpayOrder(req.params.orderId!, req.user!.userId);
    sendSuccess(res, result, "Payment initiated");
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await verifyAndRecordPayment(
        req.params.orderId!, razorpayOrderId, razorpayPaymentId, razorpaySignature
    );
    sendSuccess(res, payment, "Payment verified and recorded");
});

export const fetchPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payment = await getPaymentForOrder(req.params.orderId!, req.user!.userId);
    sendSuccess(res, payment);
});
