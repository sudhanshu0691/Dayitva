// ============================================================
// Authentication Routes
// POST /api/auth/*
// ============================================================

import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import {
  registerSchema,
  loginSchema,
  nonceRequestSchema,
  metamaskLoginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator";

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 * Body: { name, email, password, role, ... }
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login with email and password.
 * Body: { email, password }
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * POST /api/auth/nonce
 * Get a nonce for MetaMask signature.
 * Body: { walletAddress }
 */
router.post("/nonce", validate(nonceRequestSchema), authController.requestNonce);

/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 * Body: { walletAddress, signature }
 */
router.post("/metamask", validate(metamaskLoginSchema), authController.metamaskLogin);

/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 * Body: { refreshToken }
 */
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

/**
 * POST /api/auth/logout
 * Logout (revoke refresh tokens). Requires authentication.
 */
router.post("/logout", authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Get current user profile. Requires authentication.
 */
router.get("/me", authenticate, authController.getMe);

export default router;