import dotenv from "dotenv";
dotenv.config();

const getRequiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

const getOptionalEnv = (name: string): string | undefined => {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        return undefined;
    }
    return value;
};

const getRequiredNumberEnv = (name: string): number => {
    const value = getRequiredEnv(name);
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
};

const getOptionalNumberEnv = (name: string): number | undefined => {
    const value = getOptionalEnv(name);
    if (value === undefined) {
        return undefined;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
};

export const config = {
    env: getRequiredEnv("NODE_ENV"),
    port: getRequiredNumberEnv("PORT"),
    jwtSecret: getRequiredEnv("JWT_SECRET"),
    jwtExpiresIn: getRequiredEnv("JWT_EXPIRES_IN"),
    jwtRefreshSecret: getRequiredEnv("JWT_REFRESH_SECRET"),
    jwtRefreshExpiresIn: getRequiredEnv("JWT_REFRESH_EXPIRES_IN"),
    allowedOrigins: getRequiredEnv("ALLOWED_ORIGINS").split(",").map((origin) => origin.trim()),
    rateLimitWindowMs: getRequiredNumberEnv("RATE_LIMIT_WINDOW_MS"),
    rateLimitMax: getRequiredNumberEnv("RATE_LIMIT_MAX"),

    razorpay: {
        keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
        keySecret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
    },

    imagekit: {
        urlEndpoint: getOptionalEnv("IMAGEKIT_URL_ENDPOINT"),
        publicKey: getOptionalEnv("IMAGEKIT_PUBLIC_KEY"),
        privateKey: getOptionalEnv("IMAGEKIT_PRIVATE_KEY"),
        baseFolder: getOptionalEnv("IMAGEKIT_BASE_FOLDER"),
    },

    shiprocket: {
        email: getOptionalEnv("SHIPROCKET_EMAIL"),
        password: getOptionalEnv("SHIPROCKET_PASSWORD"),
        baseUrl: getOptionalEnv("SHIPROCKET_BASE_URL"),
        pickupLocation: getOptionalEnv("SHIPROCKET_PICKUP_LOCATION"),
        channelId: getOptionalEnv("SHIPROCKET_CHANNEL_ID"),
        billingCountry: getOptionalEnv("SHIPROCKET_BILLING_COUNTRY"),
        packageLength: getOptionalNumberEnv("SHIPROCKET_PACKAGE_LENGTH"),
        packageBreadth: getOptionalNumberEnv("SHIPROCKET_PACKAGE_BREADTH"),
        packageHeight: getOptionalNumberEnv("SHIPROCKET_PACKAGE_HEIGHT"),
        packageWeight: getOptionalNumberEnv("SHIPROCKET_PACKAGE_WEIGHT"),
    },
};
