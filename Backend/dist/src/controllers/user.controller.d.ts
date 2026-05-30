import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * GET /api/users/:id
 * Get user profile by ID
 */
export declare function getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/users/profile
 * Update current user profile
 */
export declare function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/users/kyc/status
 * Get KYC status for current user
 */
export declare function getKYCStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/users/kyc/submit
 * Submit KYC documents for verification
 */
export declare function submitKYC(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/users/kyc/pending
 * Get pending KYC applications (Officer only)
 */
export declare function getPendingKYC(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/users/kyc/:vendorId/verify
 * Verify vendor KYC (Officer only)
 */
export declare function verifyKYC(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/users
 * Get all users (Admin/Officer only)
 */
export declare function getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
export declare function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map