// ============================================================
// Tender Routes
// All routes related to tender management
// ============================================================

import { Router } from "express";
import * as tenderController from "../controllers/tender.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { tenderLimiter } from "../middleware/rateLimiter";
import {
  createTenderSchema,
  updateTenderSchema,
  tenderQuerySchema,
} from "../validators/tender.validator";
import { submitBidSchema, revealBidSchema } from "../validators/bid.validator";

const router = Router();

// Public routes
/**
 * GET /api/tenders
 * List all tenders (public). Supports query params: status, ministry, search, page, limit.
 */
router.get("/", validate(tenderQuerySchema, "query"), tenderController.listTenders);

/**
 * GET /api/tenders/:id
 * Get a single tender by ID (public).
 */
router.get("/:id", tenderController.getTenderById);

// Officer-only routes (authenticated + authorized)
/**
 * POST /api/tenders
 * Create a new tender (Officer only).
 */
router.post(
  "/",
  authenticate,
  authorize("officer"),
  tenderLimiter,
  validate(createTenderSchema),
  tenderController.createTender
);

/**
 * PUT /api/tenders/:id
 * Update a tender (Officer only).
 */
router.put(
  "/:id",
  authenticate,
  authorize("officer"),
  validate(updateTenderSchema),
  tenderController.updateTender
);

/**
 * PATCH /api/tenders/:id/status
 * Update tender status (Officer only).
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("officer"),
  tenderController.updateTenderStatus
);

/**
 * DELETE /api/tenders/:id
 * Delete a tender (Officer only).
 */
router.delete(
  "/:id",
  authenticate,
  authorize("officer"),
  tenderController.deleteTender
);

// Vendor routes
/**
 * POST /api/tenders/:id/bids
 * Submit a bid (Vendor only).
 */
router.post(
  "/:id/bids",
  authenticate,
  authorize("vendor"),
  validate(submitBidSchema),
  tenderController.submitBid
);

/**
 * POST /api/tenders/:id/bids/reveal
 * Reveal a bid after deadline (Vendor only).
 */
router.post(
  "/:id/bids/reveal",
  authenticate,
  authorize("vendor"),
  validate(revealBidSchema),
  tenderController.revealBid
);

/**
 * GET /api/tenders/:id/bids
 * Get bids for a tender (Officer only).
 */
router.get(
  "/:id/bids",
  authenticate,
  authorize("officer"),
  tenderController.getTenderBids
);

/**
 * POST /api/tenders/:id/evaluate
 * Evaluate tender and declare winner (Officer only).
 */
router.post(
  "/:id/evaluate",
  authenticate,
  authorize("officer"),
  tenderController.evaluateTender
);

export default router;