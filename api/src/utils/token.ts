import jwt from "jsonwebtoken";
import { config } from "../config";

export interface TokenPayload {
    userId: string;
    role: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
    jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
    jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn } as jwt.SignOptions);

export const verifyAccessToken = (token: string): TokenPayload =>
    jwt.verify(token, config.jwtSecret) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
    jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
