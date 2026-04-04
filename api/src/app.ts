import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { config } from "./config";
import { logger } from "./config/logger";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import categoryRoutes from "./modules/categories/categories.routes";
import productRoutes from "./modules/products/products.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/orders.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import shippingRoutes from "./modules/shipping/shipping.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import couponRoutes from "./modules/coupons/coupons.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import adminRoutes from "./modules/admin/admin.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || config.allowedOrigins.includes(origin)) callback(null, true);
            else callback(new Error(`CORS: Origin '${origin}' not allowed`));
        },
        credentials: true,
    })
);

// ── Request parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Static files
app.use("/uploads", express.static("public/uploads"));

// ── Logging ─────────────────────────────────────────────────────────────────
app.use(
    morgan("combined", {
        stream: { write: (msg) => logger.http(msg.trim()) },
        skip: () => config.env === "test",
    })
);

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({ success: true, message: "SN HandCrafts API is live!" });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: config.env });
});

// ── API Routes ───────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/cart`, cartRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/shipping`, shippingRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/coupons`, couponRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/wishlist`, wishlistRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
