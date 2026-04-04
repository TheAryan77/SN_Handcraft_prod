import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/authenticate";
import { createShipment, trackShipment } from "./shipping.service";

export const ship = asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipment = await createShipment(req.params.orderId!);
    sendSuccess(res, shipment, "Shipment created", 201);
});

export const track = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await trackShipment(req.params.orderId!, req.user!.userId);
    sendSuccess(res, result);
});
