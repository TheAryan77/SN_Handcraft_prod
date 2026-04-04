import winston from "winston";
import { config } from "../config";

export const logger = winston.createLogger({
    level: config.env === "development" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        config.env === "development"
            ? winston.format.colorize()
            : winston.format.uncolorize(),
        winston.format.printf(({ timestamp, level, message, stack }) =>
            stack
                ? `[${timestamp}] ${level}: ${message}\n${stack}`
                : `[${timestamp}] ${level}: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});
