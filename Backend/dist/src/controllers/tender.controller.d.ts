import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * POST /api/tenders
 * Create a new tender (Officer only).
 */
export declare function createTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/tenders
 * List tenders with filtering and pagination.
 */
export declare function listTenders(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/tenders/:id
 * Get tender by ID with full details.
 */
export declare function getTenderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/tenders/:id
 * Update a tender (Officer only).
 */
export declare function updateTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/tenders/:id/status
 * Update tender status (Officer only).
 */
export declare function updateTenderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/tenders/:id
 * Delete a tender (Officer only, no bids).
 */
export declare function deleteTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/tenders/:id/bids
 * Submit a bid (Vendor only).
 */
export declare function submitBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/tenders/:id/bids/reveal
 * Reveal a bid after deadline (Vendor only).
 */
export declare function revealBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/tenders/:id/bids
 * Get all bids for a tender (Officer only).
 */
export declare function getTenderBids(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/tenders/:id/evaluate
 * Evaluate tender and declare winner (Officer only).
 */
export declare function evaluateTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tender.controller.d.ts.map