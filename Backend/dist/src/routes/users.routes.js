"use strict";
// ============================================================
// User Routes
// Profile management and KYC verification
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
const userController = __importStar(require("../controllers/user.controller"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const validate_1 = require("../middleware/validate");
const user_validator_1 = require("../validators/user.validator");
const userService = __importStar(require("../services/user.service"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const submitKYCSchema = zod_1.z.object({
    pan: zod_1.z.string().optional(),
    gst: zod_1.z.string().optional(),
    solvencyCertificate: zod_1.z.string().optional(),
    regNumber: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
});
const verifyKYCSchema = zod_1.z.object({
    status: zod_1.z.enum(["Approved", "Rejected"]),
    remarks: zod_1.z.string().optional(),
});
/**
 * GET /api/users/me
 * Get current user profile (uses auth/me endpoint).
 * This is a convenience alias.
 */
router.get("/me", auth_1.authenticate, async (req, res, next) => {
    try {
        const { getCurrentUser } = await Promise.resolve().then(() => __importStar(require("../services/auth.service")));
        const user = await getCurrentUser(req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users/:id
 * Get user profile by ID
 */
router.get("/:id", auth_1.authenticate, userController.getUserById);
/**
 * PUT /api/users/profile
 * Update current user profile.
 */
router.put("/profile", auth_1.authenticate, (0, validate_1.validate)(user_validator_1.updateProfileSchema), userController.updateProfile);
/**
 * GET /api/users/kyc/status
 * Get KYC status for current user
 */
router.get("/kyc/status", auth_1.authenticate, userController.getKYCStatus);
/**
 * POST /api/users/kyc/submit
 * Submit KYC documents
 */
router.post("/kyc/submit", auth_1.authenticate, (0, roleGuard_1.authorize)("vendor"), (0, validate_1.validate)(submitKYCSchema), userController.submitKYC);
/**
 * GET /api/users/kyc/pending
 * Get pending KYC applications (Officer only)
 */
router.get("/kyc/pending", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), userController.getPendingKYC);
/**
 * PUT /api/users/kyc/:vendorId/verify
 * Verify vendor KYC (Officer only).
 */
router.put("/kyc/:vendorId/verify", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), (0, validate_1.validate)(user_validator_1.kycVerificationSchema), async (req, res, next) => {
    try {
        const user = await userService.verifyKYC(req.params.vendorId, req.body, req.user.userId);
        res.json({ success: true, message: `KYC ${req.body.status}`, data: user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/users (list all users)
 * Get all users (Officer only)
 */
router.get("/", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), userController.getAllUsers);
exports.default = router;
//# sourceMappingURL=users.routes.js.map