// ============================================================
// JWT Authentication Middleware
// Verifies Bearer token from Authorization header
// ============================================================

import { Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";

/**
 * Authentication middleware.
 * Extracts and verifies JWT Bearer token from Authorization header.
 * Attaches decoded user payload to request.user.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authentication required. No token provided.", 401);
    }

    // Expect "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError("Invalid authorization header format. Use: Bearer <token>", 401);
    }

    const token = parts[1];
    const decoded: TokenPayload = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      walletAddress: decoded.walletAddress,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid or expired token", 401));
    }
  }
}

/**
 * Optional authentication middleware.
 * Attaches user info if token is present, but doesn't fail if missing.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        const decoded = verifyAccessToken(parts[1]);
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          walletAddress: decoded.walletAddress,
        };
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
}