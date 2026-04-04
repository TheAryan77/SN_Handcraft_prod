import { EventEmitter } from "events";
import { prisma } from "@/config/db";
import { logger } from "../config/logger";
import { sendEmail } from "../modules/notifications/notifications.service";

export const eventEmitter = new EventEmitter();

// Order Events
eventEmitter.on("order.placed", async (order) => {
    logger.info(`Event: order.placed | Order ID: ${order.id}`);

    // Trigger background jobs
    try {
        const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { email: true },
        });

        if (!user?.email) {
            throw new Error(`Unable to send order confirmation: user email not found for order ${order.id}`);
        }

        // 1. Send confirmation email (mock)
        await sendEmail(
            user.email,
            "Order Confirmation",
            `Thank you for your order! Your order ID is ${order.id}. Total amount: ${order.totalAmount}`
        );

        // 2. Additional internal notifications
        logger.info(`Handled order.placed for ${order.id}`);
    } catch (err) {
        logger.error(`Error handling order.placed for ${order.id}:`, err);
    }
});

eventEmitter.on("order.status.updated", async ({ orderId, status }) => {
    logger.info(`Event: order.status.updated | Order ID: ${orderId} | New Status: ${status}`);
    // Handle status update notifications, etc.
});
