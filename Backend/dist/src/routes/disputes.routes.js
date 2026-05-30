"use strict";
// ============================================================
// Dispute Routes
// All routes related to dispute management
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
const disputeController = __importStar(require("../controllers/dispute.controller"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Create dispute schema
const createDisputeSchema = zod_1.z.object({
    tenderId: zod_1.z.string(),
    text: zod_1.z.string().min(10),
    category: zod_1.z.string().optional(),
});
const updateDisputeStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["Open", "UnderReview", "Resolved", "Dismissed"]),
    resolution: zod_1.z.string().optional(),
});
/**
 * POST /api/disputes
 * Create a new dispute (Authenticated users)
 */
router.post("/", auth_1.authenticate, (0, validate_1.validate)(createDisputeSchema), disputeController.createDispute);
/**
 * GET /api/disputes
 * List disputes with filters (Officer only)
 */
router.get("/", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), disputeController.listDisputes);
/**
 * GET /api/disputes/:id
 * Get dispute by ID
 */
router.get("/:id", auth_1.authenticate, disputeController.getDisputeById);
/**
 * GET /api/disputes/tender/:tenderId
 * Get disputes for a specific tender
 */
router.get("/tender/:tenderId", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), disputeController.getDisputesByTender);
/**
 * PUT /api/disputes/:id/status
 * Update dispute status (Officer only)
 */
router.put("/:id/status", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), (0, validate_1.validate)(updateDisputeStatusSchema), disputeController.updateDisputeStatus);
exports.default = router;
//# sourceMappingURL=disputes.routes.js.map