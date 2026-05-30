"use strict";
// ============================================================
// Dispute Controller
// Handles dispute creation and management
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
exports.createDispute = createDispute;
exports.getDisputeById = getDisputeById;
exports.getDisputesByTender = getDisputesByTender;
exports.updateDisputeStatus = updateDisputeStatus;
exports.listDisputes = listDisputes;
const disputeService = __importStar(require("../services/dispute.service"));
const logger_1 = require("../utils/logger");
/**
 * POST /api/disputes
 * Create a new dispute
 */
async function createDispute(req, res, next) {
    try {
        const dispute = await disputeService.createDispute(req.body.tenderId, req.user.userId, req.body.text, req.body.category);
        logger_1.logger.info(`Dispute created: ${dispute.id} for tender: ${dispute.tenderId}`);
        res.status(201).json({
            success: true,
            message: "Dispute created successfully",
            data: dispute,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/disputes/:id
 * Get dispute details
 */
async function getDisputeById(req, res, next) {
    try {
        const dispute = await disputeService.getDisputeById(req.params.id);
        res.status(200).json({
            success: true,
            data: dispute,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/disputes/tender/:tenderId
 * Get disputes for a tender
 */
async function getDisputesByTender(req, res, next) {
    try {
        const disputes = await disputeService.getDisputesByTender(req.params.tenderId);
        res.status(200).json({
            success: true,
            data: disputes,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/disputes/:id/status
 * Update dispute status (Officer only)
 */
async function updateDisputeStatus(req, res, next) {
    try {
        const dispute = await disputeService.updateDisputeStatus(req.params.id, req.body.status, req.body.resolution || "");
        logger_1.logger.info(`Dispute ${req.params.id} status updated to: ${req.body.status}`);
        res.status(200).json({
            success: true,
            message: "Dispute status updated",
            data: dispute,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/disputes
 * List all disputes (with filters)
 */
async function listDisputes(req, res, next) {
    try {
        const result = await disputeService.listDisputes(req.query);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=dispute.controller.js.map