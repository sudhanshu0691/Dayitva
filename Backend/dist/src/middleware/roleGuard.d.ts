import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
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
export declare function authorize(...roles: string[]): (req: AuthRequest, _res: Response, next: NextFunction) => void;
/**
 * Check if the request user is an officer/administrator.
 */
export declare function isOfficer(req: AuthRequest, _res: Response, next: NextFunction): void;
/**
 * Check if the request user is a vendor/bidder.
 */
export declare function isVendor(req: AuthRequest, _res: Response, next: NextFunction): void;
/**
 * Check if the request user is a public/citizen/auditor.
 */
export declare function isPublic(req: AuthRequest, _res: Response, next: NextFunction): void;
//# sourceMappingURL=roleGuard.d.ts.map