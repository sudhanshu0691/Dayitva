// ============================================================
// JWT Token Utility
// Handles access & refresh token generation and verification
// ============================================================

import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  userId: string;
  role: string;
  walletAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate an access token (short-lived, typically 15 minutes).
 * @param payload - User identifier and role
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Generate a refresh token (long-lived, typically 7 days).
 * @param payload - User identifier
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: Pick<TokenPayload, "userId">): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as string, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Generate an access + refresh token pair.
 */
export function generateTokenPair(payload: TokenPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ userId: payload.userId }),
  };
}

/**
 * Verify and decode an access token.
 * @returns Decoded payload or throws
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 * @returns Decoded payload with userId
 */
export function verifyRefreshToken(token: string): Pick<TokenPayload, "userId"> {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as Pick<TokenPayload, "userId">;
}