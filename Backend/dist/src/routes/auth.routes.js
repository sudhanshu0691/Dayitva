"use strict";
// ============================================================
// Authentication Routes
// POST /api/auth/*
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
const authController = __importStar(require("../controllers/auth.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(rateLimiter_1.authLimiter);
/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 * Body: { name, email, password, role, ... }
 */
router.post("/register", (0, validate_1.validate)(auth_validator_1.registerSchema), authController.register);
/**
 * POST /api/auth/login
 * Login with email and password.
 * Body: { email, password }
 */
router.post("/login", (0, validate_1.validate)(auth_validator_1.loginSchema), authController.login);
/**
 * POST /api/auth/nonce
 * Get a nonce for MetaMask signature.
 * Body: { walletAddress }
 */
router.post("/nonce", (0, validate_1.validate)(auth_validator_1.nonceRequestSchema), authController.requestNonce);
/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 * Body: { walletAddress, signature }
 */
router.post("/metamask", (0, validate_1.validate)(auth_validator_1.metamaskLoginSchema), authController.metamaskLogin);
/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 * Body: { refreshToken }
 */
router.post("/refresh", (0, validate_1.validate)(auth_validator_1.refreshTokenSchema), authController.refresh);
/**
 * POST /api/auth/logout
 * Logout (revoke refresh tokens). Requires authentication.
 */
router.post("/logout", auth_1.authenticate, authController.logout);
/**
 * GET /api/auth/me
 * Get current user profile. Requires authentication.
 */
router.get("/me", auth_1.authenticate, authController.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map