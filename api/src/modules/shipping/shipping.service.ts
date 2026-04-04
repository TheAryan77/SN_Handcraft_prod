import axios from "axios";
import { prisma, Prisma } from "@/config/db";
import { config } from "../../config";
import { createError } from "../../middlewares/errorHandler";

interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
}

let shiprocketToken: string | null = null;
let tokenExpiry: Date | null = null;

const assertShiprocketConfig = () => {
    const requiredConfig = {
        SHIPROCKET_EMAIL: config.shiprocket.email,
        SHIPROCKET_PASSWORD: config.shiprocket.password,
        SHIPROCKET_BASE_URL: config.shiprocket.baseUrl,
        SHIPROCKET_PICKUP_LOCATION: config.shiprocket.pickupLocation,
        SHIPROCKET_CHANNEL_ID: config.shiprocket.channelId,
        SHIPROCKET_PACKAGE_LENGTH: config.shiprocket.packageLength,
        SHIPROCKET_PACKAGE_BREADTH: config.shiprocket.packageBreadth,
        SHIPROCKET_PACKAGE_HEIGHT: config.shiprocket.packageHeight,
        SHIPROCKET_PACKAGE_WEIGHT: config.shiprocket.packageWeight,
    } as const;

    const missing = Object.entries(requiredConfig)
        .filter(([, value]) => value === undefined || value === null || value === "")
        .map(([key]) => key);

    if (missing.length > 0) {
        throw createError(
            `Missing Shiprocket configuration: ${missing.join(", ")}`,
            500
        );
    }
};

const getShiprocketToken = async (): Promise<string> => {
    assertShiprocketConfig();
    if (shiprocketToken && tokenExpiry && tokenExpiry > new Date()) return shiprocketToken;
    const res = await axios.post(`${config.shiprocket.baseUrl}/auth/login`, {
        email: config.shiprocket.email,
        password: config.shiprocket.password,
    });
    shiprocketToken = res.data.token as string;
    tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
    return shiprocketToken;
};

export const createShipment = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } }, user: true },
    });
    if (!order) throw createError("Order not found", 404);
    if (order.paymentStatus !== "PAID") throw createError("Order must be paid before shipping", 400);

    const token = await getShiprocketToken();

    const address = await prisma.address.findFirst({
        where: { userId: order.userId },
        orderBy: { id: "desc" },
    });

    if (!address) {
        throw createError("No delivery address found for user", 400);
    }

    const orderItems: ShiprocketOrderItem[] = order.items.map((i) => ({
        name: i.product.name,
        sku: i.productId,
        units: i.quantity,
        selling_price: i.price,
    }));

    const srRes = await axios.post(
        `${config.shiprocket.baseUrl}/orders/create/adhoc`,
        {
            order_id: order.id,
            order_date: order.createdAt,
            pickup_location: config.shiprocket.pickupLocation,
            channel_id: config.shiprocket.channelId,
            billing_customer_name: order.user.name,
            billing_address: [address.line1, address.line2].filter(Boolean).join(", "),
            billing_city: address.city,
            billing_pincode: address.postalCode,
            billing_state: address.state,
            billing_country: address.country,
            billing_email: order.user.email,
            billing_phone: address.phone,
            order_items: orderItems,
            payment_method: "Prepaid",
            sub_total: order.totalAmount,
            length: config.shiprocket.packageLength,
            breadth: config.shiprocket.packageBreadth,
            height: config.shiprocket.packageHeight,
            weight: config.shiprocket.packageWeight,
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const trackingId = srRes.data.awb_code as string | undefined;
    const courier = srRes.data.courier_name as string | undefined;

    if (!trackingId || !courier) {
        throw createError("Shiprocket response is missing tracking details", 502);
    }

    const shipment = await prisma.shipment.create({
        data: { orderId, courier, trackingId, status: "PROCESSING" },
    });
    await prisma.order.update({ where: { id: orderId }, data: { status: "PACKED" } });
    return shipment;
};

export const trackShipment = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw createError("Order not found", 404);
    const shipment = await prisma.shipment.findUnique({ where: { orderId } });
    if (!shipment) throw createError("Shipment not found", 404);
    try {
        const token = await getShiprocketToken();
        const res = await axios.get(
            `${config.shiprocket.baseUrl}/courier/track/awb/${shipment.trackingId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { shipment, tracking: res.data };
    } catch {
        return { shipment, tracking: null };
    }
};
