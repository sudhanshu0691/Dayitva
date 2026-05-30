// ============================================================
// Dispute Controller
// Handles dispute creation and management
// ============================================================

import { Response, NextFunction } from "express";
import * as disputeService from "../services/dispute.service";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

/**
 * POST /api/disputes
 * Create a new dispute
 */
export async function createDispute(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.createDispute(
      req.body.tenderId as string,
      req.user!.userId,
      req.body.text as string,
      req.body.category as string | undefined
    );
    logger.info(`Dispute created: ${dispute.id} for tender: ${dispute.tenderId}`);
    res.status(201).json({
      success: true,
      message: "Dispute created successfully",
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/disputes/:id
 * Get dispute details
 */
export async function getDisputeById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.getDisputeById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/disputes/tender/:tenderId
 * Get disputes for a tender
 */
export async function getDisputesByTender(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const disputes = await disputeService.getDisputesByTender(req.params.tenderId as string);
    res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/disputes/:id/status
 * Update dispute status (Officer only)
 */
export async function updateDisputeStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.updateDisputeStatus(
      req.params.id as string,
      req.body.status as string,
      req.body.resolution as string || ""
    );
    logger.info(`Dispute ${req.params.id} status updated to: ${req.body.status}`);
    res.status(200).json({
      success: true,
      message: "Dispute status updated",
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/disputes
 * List all disputes (with filters)
 */
export async function listDisputes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await disputeService.listDisputes(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
