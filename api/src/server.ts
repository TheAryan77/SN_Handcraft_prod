import "dotenv/config";
import app from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { prisma } from "@/config/db";

const start = async () => {
    try {
        // Verify DB connection
        await prisma.$connect();
        logger.info("✅ Database connected");

        const server = app.listen(config.port, () => {
            logger.info(`🚀 API server running on http://localhost:${config.port}`);
            logger.info(`   Environment : ${config.env}`);
            logger.info(`   API Base    : http://localhost:${config.port}/api/v1`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(async () => {
                await prisma.$disconnect();
                logger.info("Database disconnected. Bye 👋");
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (err) {
        logger.error("Failed to start server:", err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

start();
