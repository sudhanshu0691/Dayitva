// ============================================================
// Role-Based Access Control Middleware
// Restricts routes to specific user roles
// Updated: Uses independent Vendor and Officer models
// ============================================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";
import { prisma } from "../config/database";

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
 * Find user by ID in either Vendor or Officer table (for KYC check)
 */
async function findUserForKYC(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: userId },
    select: { id: true, kycStatus: true, role: true },
  });
  if (vendor) return vendor;
  const officer = await prisma.officer.findUnique({
    where: { id: userId },
    select: { id: true, kycStatus: true, role: true },
  });
  return officer;
}

/**
 * KYC Guard: Ensures user has approved KYC before accessing routes.
 * Use on routes that require KYC verification (create tender, place bid).
 */
export async function requireKYC(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await findUserForKYC(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.kycStatus !== "Approved") {
      throw new AppError(
        `KYC verification required. Your KYC status is "${user.kycStatus}". Please complete KYC verification first.`,
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("KYC verification check failed", 500));
    }
  }
}

/**
 * Officer KYC Guard: Ensures user is an officer with approved KYC.
 * Use on tender creation routes.
 */
export async function requireOfficerKYC(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await findUserForKYC(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "officer") {
      throw new AppError("Only officers can perform this action", 403);
    }

    if (user.kycStatus !== "Approved") {
      throw new AppError(
        `Officer KYC not approved (status: ${user.kycStatus}). Complete KYC to create tenders.`,
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("KYC verification check failed", 500));
    }
  }
}