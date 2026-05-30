import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * GET /api/dashboard/officer
 * Get officer dashboard statistics
 */
export declare function getOfficerDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/dashboard/vendor
 * Get vendor dashboard statistics
 */
export declare function getVendorDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/dashboard/analytics
 * Get system-wide analytics (Admin only)
 */
export declare function getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/reports/tenders
 * Get tender reports with filters
 */
export declare function getTenderReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/reports/bids
 * Get bid reports and analysis
 */
export declare function getBidReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/reports/kyc
 * Get KYC verification reports (Officer only)
 */
export declare function getKYCReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=dashboard.controller.d.ts.map