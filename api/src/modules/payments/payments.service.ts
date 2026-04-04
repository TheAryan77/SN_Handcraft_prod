import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/config/db";
import { config } from "../../config";
import { createError } from "../../middlewares/errorHandler";

const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});

export const createRazorpayOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw createError("Order not found", 404);
    if (order.paymentStatus === "PAID") throw createError("Order already paid", 400);

    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.totalAmount * 100), // paise
        currency: "INR",
        receipt: order.id,
    });

    return { razorpayOrderId: razorpayOrder.id, amount: order.totalAmount, currency: "INR" };
};

export const verifyAndRecordPayment = async (
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
) => {
    // Verify HMAC signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw createError("Payment verification failed", 400);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError("Order not found", 404);

    const [payment] = await prisma.$transaction([
        prisma.payment.create({
            data: {
                orderId,
                provider: "razorpay",
                amount: order.totalAmount,
                status: "PAID",
                transactionId: razorpayPaymentId,
            },
        }),
        prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "PAID", status: "CONFIRMED" },
        }),
    ]);

    return payment;
};

export const getPaymentForOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw createError("Order not found", 404);
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw createError("Payment not found", 404);
    return payment;
};
