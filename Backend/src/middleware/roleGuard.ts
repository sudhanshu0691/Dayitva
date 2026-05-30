// ============================================================
// Role-Based Access Control Middleware
// Restricts routes to specific user roles
// ============================================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";

/**
 * Role guard middleware factory.
 * Creates middleware that restricts access to specified roles.
 * Must be used AFTER authenticate middleware.
 * 
 * @param roles - Allowed roles (e.g., ["officer"], ["vendor"], ["officer", "vendor"])
 * @returns Express middleware
 * 
 * Usage:
 *   router.post("/tenders", authenticate, authorize("officer"), createTender);
 *   router.post("/tenders/:id/bids", authenticate, authorize("vendor"), submitBid);
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
          403
        )
      );
      return;
    }

    next();
  };
}

/**
 * Check if the request user is an officer/administrator.
 */
export function isOfficer(req: AuthRequest, _res: Response, next: NextFunction): void {
  authorize("officer")(req, _res, next);
}

/**
 * Check if the request user is a vendor/bidder.
 */
export function isVendor(req: AuthRequest, _res: Response, next: NextFunction): void {
  authorize("vendor")(req, _res, next);
}

/**
 * Check if the request user is a public/citizen/auditor.
 */
export function isPublic(req: AuthRequest, _res: Response, next: NextFunction): void {
  authorize("public")(req, _res, next);
}