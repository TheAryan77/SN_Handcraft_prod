import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { getDashboardStats, getRevenueByMonth } from "./analytics.service";

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await getDashboardStats();
    sendSuccess(res, stats, "Dashboard stats");
});

export const revenueChart = asyncHandler(async (_req: Request, res: Response) => {
    const data = await getRevenueByMonth();
    sendSuccess(res, data, "Monthly revenue");
});
