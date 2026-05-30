// ============================================================
// Tender Controller
// Handles HTTP request/response for tender endpoints
// ============================================================

import { Response, NextFunction } from "express";
import * as tenderService from "../services/tender.service";
import * as bidService from "../services/bid.service";
import { AuthRequest } from "../types";

/**
 * POST /api/tenders
 * Create a new tender (Officer only).
 */
export async function createTender(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tender = await tenderService.createTender(req.body, req.user!.userId);
    res.status(201).json({ success: true, message: "Tender created successfully", data: tender });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tenders
 * List tenders with filtering and pagination.
 */
export async function listTenders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await tenderService.listTenders(req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tenders/:id
 * Get tender by ID with full details.
 */
export async function getTenderById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tender = await tenderService.getTenderById(req.params.id as string);
    res.status(200).json({ success: true, data: tender });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tenders/:id
 * Update a tender (Officer only).
 */
export async function updateTender(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tender = await tenderService.updateTender(req.params.id as string, req.body, req.user!.userId);
    res.status(200).json({ success: true, data: tender });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tenders/:id/status
 * Update tender status (Officer only).
 */
export async function updateTenderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tender = await tenderService.updateTenderStatus(req.params.id as string, req.body.status, req.user!.userId);
    res.status(200).json({ success: true, data: tender });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tenders/:id
 * Delete a tender (Officer only, no bids).
 */
export async function deleteTender(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tenderService.deleteTender(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, message: "Tender deleted successfully" });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tenders/:id/bids
 * Submit a bid (Vendor only).
 */
export async function submitBid(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bid = await bidService.submitBid(req.params.id as string, req.body, req.user!.userId);
    res.status(201).json({ success: true, message: "Bid submitted successfully", data: bid });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tenders/:id/bids/reveal
 * Reveal a bid after deadline (Vendor only).
 */
export async function revealBid(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bid = await bidService.revealBid(req.params.id as string, req.body, req.user!.userId);
    res.status(200).json({ success: true, message: "Bid revealed successfully", data: bid });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tenders/:id/bids
 * Get all bids for a tender (Officer only).
 */
export async function getTenderBids(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bids = await bidService.getTenderBids(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tenders/:id/evaluate
 * Evaluate tender and declare winner (Officer only).
 */
export async function evaluateTender(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await bidService.evaluateTender(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, message: "Tender evaluated successfully", data: result });
  } catch (error) {
    next(error);
  }
}