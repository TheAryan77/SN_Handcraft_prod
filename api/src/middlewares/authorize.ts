import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { sendError } from "../utils/response";

/**
 * Role-based authorization middleware.
 * Usage: authorize("ADMIN") or authorize("ADMIN", "CUSTOMER")
 */
export const authorize =
    (...roles: string[]) =>
        (req: AuthRequest, res: Response, next: NextFunction): void => {
            if (!req.user || !roles.includes(req.user.role)) {
                sendError(res, "You are not authorized to perform this action", 403);
                return;
            }
            next();
        };
