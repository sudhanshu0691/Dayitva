import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * POST /api/disputes
 * Create a new dispute
 */
export declare function createDispute(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/disputes/:id
 * Get dispute details
 */
export declare function getDisputeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/disputes/tender/:tenderId
 * Get disputes for a tender
 */
export declare function getDisputesByTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/disputes/:id/status
 * Update dispute status (Officer only)
 */
export declare function updateDisputeStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/disputes
 * List all disputes (with filters)
 */
export declare function listDisputes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=dispute.controller.d.ts.map