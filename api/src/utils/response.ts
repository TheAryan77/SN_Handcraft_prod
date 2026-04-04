import { Response } from "express";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200,
    meta?: Record<string, unknown>
): Response => {
    const body: ApiResponse<T> = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
};

export const sendError = (
    res: Response,
    message = "Internal Server Error",
    statusCode = 500,
    errors?: unknown
): Response => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {}),
    });
};
