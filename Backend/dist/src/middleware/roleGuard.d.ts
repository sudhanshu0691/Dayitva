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
 * KYC Guard: Ensures user has approved KYC before accessing routes.
 * Use on routes that require KYC verification (create tender, place bid).
 */
export declare function requireKYC(req: AuthRequest, _res: Response, next: NextFunction): Promise<void>;
/**
 * Officer KYC Guard: Ensures user is an officer with approved KYC.
 * Use on tender creation routes.
 */
export declare function requireOfficerKYC(req: AuthRequest, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=roleGuard.d.ts.map