// ============================================================
// User Routes
// Profile management and KYC verification
// ============================================================

import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { updateProfileSchema, kycVerificationSchema } from "../validators/user.validator";
import * as userService from "../services/user.service";
import { AuthRequest, IApiResponse } from "../types";
import { Response, NextFunction } from "express";
import { z } from "zod";

const router = Router();

const submitKYCSchema = z.object({
  pan: z.string().optional(),
  gst: z.string().optional(),
  solvencyCertificate: z.string().optional(),
  regNumber: z.string().optional(),
  companyName: z.string().optional(),
});

const verifyKYCSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
  remarks: z.string().optional(),
});

/**
 * GET /api/users/me
 * Get current user profile (uses auth/me endpoint).
 * This is a convenience alias.
 */
router.get("/me", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { getCurrentUser } = await import("../services/auth.service");
    const user = await getCurrentUser(req.user!.userId);
    res.json({ success: true, data: user } as IApiResponse);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
router.get("/:id", authenticate, userController.getUserById);

/**
 * PUT /api/users/profile
 * Update current user profile.
 */
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile
);

/**
 * GET /api/users/kyc/status
 * Get KYC status for current user
 */
router.get("/kyc/status", authenticate, userController.getKYCStatus);

/**
 * POST /api/users/kyc/submit
 * Submit KYC documents (for both vendors and officers)
 */
router.post(
  "/kyc/submit",
  authenticate,
  validate(submitKYCSchema),
  userController.submitKYC
);

/**
 * GET /api/users/kyc/pending
 * Get pending KYC applications (Auditor only)
 */
router.get(
  "/kyc/pending",
  authenticate,
  authorize("auditor"),
  userController.getPendingKYC
);

/**
 * GET /api/users (list all users)
 * Get all users (Officer only)
 */
router.get(
  "/",
  authenticate,
  authorize("officer"),
  userController.getAllUsers
);

export default router;