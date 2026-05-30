// ============================================================
// Dispute Routes
// All routes related to dispute management
// ============================================================

import { Router } from "express";
import * as disputeController from "../controllers/dispute.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// Create dispute schema
const createDisputeSchema = z.object({
  tenderId: z.string(),
  text: z.string().min(10),
  category: z.string().optional(),
});

const updateDisputeStatusSchema = z.object({
  status: z.enum(["Open", "UnderReview", "Resolved", "Dismissed"]),
  resolution: z.string().optional(),
});

/**
 * POST /api/disputes
 * Create a new dispute (Authenticated users)
 */
router.post(
  "/",
  authenticate,
  validate(createDisputeSchema),
  disputeController.createDispute
);

/**
 * GET /api/disputes
 * List disputes with filters (Officer only)
 */
router.get(
  "/",
  authenticate,
  authorize("officer"),
  disputeController.listDisputes
);

/**
 * GET /api/disputes/:id
 * Get dispute by ID
 */
router.get("/:id", authenticate, disputeController.getDisputeById);

/**
 * GET /api/disputes/tender/:tenderId
 * Get disputes for a specific tender
 */
router.get(
  "/tender/:tenderId",
  authenticate,
  authorize("officer"),
  disputeController.getDisputesByTender
);

/**
 * PUT /api/disputes/:id/status
 * Update dispute status (Officer only)
 */
router.put(
  "/:id/status",
  authenticate,
  authorize("officer"),
  validate(updateDisputeStatusSchema),
  disputeController.updateDisputeStatus
);

export default router;
