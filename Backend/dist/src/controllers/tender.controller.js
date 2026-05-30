"use strict";
// ============================================================
// Tender Controller
// Handles HTTP request/response for tender endpoints
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
exports.createTender = createTender;
exports.listTenders = listTenders;
exports.getTenderById = getTenderById;
exports.updateTender = updateTender;
exports.updateTenderStatus = updateTenderStatus;
exports.deleteTender = deleteTender;
exports.submitBid = submitBid;
exports.revealBid = revealBid;
exports.getTenderBids = getTenderBids;
exports.evaluateTender = evaluateTender;
const tenderService = __importStar(require("../services/tender.service"));
const bidService = __importStar(require("../services/bid.service"));
/**
 * POST /api/tenders
 * Create a new tender (Officer only).
 */
async function createTender(req, res, next) {
    try {
        const tender = await tenderService.createTender(req.body, req.user.userId);
        res.status(201).json({ success: true, message: "Tender created successfully", data: tender });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/tenders
 * List tenders with filtering and pagination.
 */
async function listTenders(req, res, next) {
    try {
        const result = await tenderService.listTenders(req.query);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/tenders/:id
 * Get tender by ID with full details.
 */
async function getTenderById(req, res, next) {
    try {
        const tender = await tenderService.getTenderById(req.params.id);
        res.status(200).json({ success: true, data: tender });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/tenders/:id
 * Update a tender (Officer only).
 */
async function updateTender(req, res, next) {
    try {
        const tender = await tenderService.updateTender(req.params.id, req.body, req.user.userId);
        res.status(200).json({ success: true, data: tender });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PATCH /api/tenders/:id/status
 * Update tender status (Officer only).
 */
async function updateTenderStatus(req, res, next) {
    try {
        const tender = await tenderService.updateTenderStatus(req.params.id, req.body.status, req.user.userId);
        res.status(200).json({ success: true, data: tender });
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/tenders/:id
 * Delete a tender (Officer only, no bids).
 */
async function deleteTender(req, res, next) {
    try {
        await tenderService.deleteTender(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: "Tender deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/tenders/:id/bids
 * Submit a bid (Vendor only).
 */
async function submitBid(req, res, next) {
    try {
        const bid = await bidService.submitBid(req.params.id, req.body, req.user.userId);
        res.status(201).json({ success: true, message: "Bid submitted successfully", data: bid });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/tenders/:id/bids/reveal
 * Reveal a bid after deadline (Vendor only).
 */
async function revealBid(req, res, next) {
    try {
        const bid = await bidService.revealBid(req.params.id, req.body, req.user.userId);
        res.status(200).json({ success: true, message: "Bid revealed successfully", data: bid });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/tenders/:id/bids
 * Get all bids for a tender (Officer only).
 */
async function getTenderBids(req, res, next) {
    try {
        const bids = await bidService.getTenderBids(req.params.id, req.user.userId);
        res.status(200).json({ success: true, data: bids });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/tenders/:id/evaluate
 * Evaluate tender and declare winner (Officer only).
 */
async function evaluateTender(req, res, next) {
    try {
        const result = await bidService.evaluateTender(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: "Tender evaluated successfully", data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=tender.controller.js.map