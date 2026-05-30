"use strict";
// ============================================================
// Tender Routes
// All routes related to tender management
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenderController = __importStar(require("../controllers/tender.controller"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const tender_validator_1 = require("../validators/tender.validator");
const bid_validator_1 = require("../validators/bid.validator");
const router = (0, express_1.Router)();
// Public routes
/**
 * GET /api/tenders
 * List all tenders (public). Supports query params: status, ministry, search, page, limit.
 */
router.get("/", (0, validate_1.validate)(tender_validator_1.tenderQuerySchema, "query"), tenderController.listTenders);
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
router.post("/", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), rateLimiter_1.tenderLimiter, (0, validate_1.validate)(tender_validator_1.createTenderSchema), tenderController.createTender);
/**
 * PUT /api/tenders/:id
 * Update a tender (Officer only).
 */
router.put("/:id", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), (0, validate_1.validate)(tender_validator_1.updateTenderSchema), tenderController.updateTender);
/**
 * PATCH /api/tenders/:id/status
 * Update tender status (Officer only).
 */
router.patch("/:id/status", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), tenderController.updateTenderStatus);
/**
 * DELETE /api/tenders/:id
 * Delete a tender (Officer only).
 */
router.delete("/:id", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), tenderController.deleteTender);
// Vendor routes
/**
 * POST /api/tenders/:id/bids
 * Submit a bid (Vendor only).
 */
router.post("/:id/bids", auth_1.authenticate, (0, roleGuard_1.authorize)("vendor"), (0, validate_1.validate)(bid_validator_1.submitBidSchema), tenderController.submitBid);
/**
 * POST /api/tenders/:id/bids/reveal
 * Reveal a bid after deadline (Vendor only).
 */
router.post("/:id/bids/reveal", auth_1.authenticate, (0, roleGuard_1.authorize)("vendor"), (0, validate_1.validate)(bid_validator_1.revealBidSchema), tenderController.revealBid);
/**
 * GET /api/tenders/:id/bids
 * Get bids for a tender (Officer only).
 */
router.get("/:id/bids", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), tenderController.getTenderBids);
/**
 * POST /api/tenders/:id/evaluate
 * Evaluate tender and declare winner (Officer only).
 */
router.post("/:id/evaluate", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), tenderController.evaluateTender);
exports.default = router;
//# sourceMappingURL=tenders.routes.js.map