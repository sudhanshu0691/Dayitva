"use strict";
// ============================================================
// User Controller
// Handles user profile, KYC verification, and management
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
exports.getUserById = getUserById;
exports.updateProfile = updateProfile;
exports.getKYCStatus = getKYCStatus;
exports.submitKYC = submitKYC;
exports.getPendingKYC = getPendingKYC;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;
const userService = __importStar(require("../services/user.service"));
const logger_1 = require("../utils/logger");
/**
 * GET /api/users/:id
 * Get user profile by ID
 */
async function getUserById(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/users/profile
 * Update current user profile
 */
async function updateProfile(req, res, next) {
    try {
        const user = await userService.updateProfile(req.user.userId, req.body);
        logger_1.logger.info(`User profile updated: ${req.user.userId}`);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/users/kyc/status
 * Get KYC status for current user
 */
async function getKYCStatus(req, res, next) {
    try {
        const user = await userService.getKYCStatus(req.user.userId);
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                kycStatus: user.kycStatus,
                documentStatus: {
                    pan: !!user.pan,
                    gst: !!user.gst,
                    solvencyCertificate: !!user.solvencyCertificate,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/users/kyc/submit
 * Submit KYC documents for verification
 */
async function submitKYC(req, res, next) {
    try {
        const user = await userService.submitKYC(req.user.userId, req.body);
        logger_1.logger.info(`KYC submitted by user: ${req.user.userId}`);
        res.status(200).json({
            success: true,
            message: "KYC documents submitted for verification",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/users/kyc/pending
 * Get pending KYC applications (Officer only)
 */
async function getPendingKYC(req, res, next) {
    try {
        const result = await userService.getPendingKYC(req.query);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/users
 * Get all users (Admin/Officer only)
 */
async function getAllUsers(req, res, next) {
    try {
        const result = await userService.getAllUsers(req.query);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
async function deleteUser(req, res, next) {
    try {
        await userService.deleteUser(req.params.id);
        logger_1.logger.info(`User deleted: ${req.params.id} by admin: ${req.user.userId}`);
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=user.controller.js.map