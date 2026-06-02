// ============================================================
// User Controller
// Handles user profile, KYC verification, and management
// ============================================================

import { Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/profile
 * Update current user profile
 */
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    logger.info(`User profile updated: ${req.user!.userId}`);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/kyc/status
 * Get KYC status for current user
 */
export async function getKYCStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getKYCStatus(req.user!.userId);
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        kycStatus: user.kycStatus,
        documentStatus: {
          pan: !!(user as any).pan,
          gst: !!(user as any).gst,
          solvencyCertificate: !!(user as any).solvencyCertificate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/kyc/submit
 * Submit KYC documents for verification
 */
export async function submitKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.submitKYC(req.user!.userId, req.body);
    logger.info(`KYC submitted by user: ${req.user!.userId}`);
    res.status(200).json({
      success: true,
      message: "KYC documents submitted for verification",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/kyc/pending
 * Get pending KYC applications (Officer only)
 */
export async function getPendingKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.getPendingKYC(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/users
 * Get all users (Admin/Officer only)
 */
export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(req.params.id as string);
    logger.info(`User deleted: ${req.params.id} by admin: ${req.user!.userId}`);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}