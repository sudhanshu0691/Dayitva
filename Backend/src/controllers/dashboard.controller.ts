// ============================================================
// Dashboard Controller
// Handles dashboard statistics and reports
// ============================================================

import { Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";
import { AuthRequest } from "../types";

/**
 * GET /api/dashboard/officer
 * Get officer dashboard statistics
 */
export async function getOfficerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getOfficerDashboard(req.user!.userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/vendor
 * Get vendor dashboard statistics
 */
export async function getVendorDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getVendorDashboard(req.user!.userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/analytics
 * Get system-wide analytics (Admin only)
 */
export async function getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const analytics = await dashboardService.getAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/tenders
 * Get tender reports with filters
 */
export async function getTenderReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reports = await dashboardService.getTenderReports(req.query);
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/bids
 * Get bid reports and analysis
 */
export async function getBidReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reports = await dashboardService.getBidReports(req.query);
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/kyc
 * Get KYC verification reports (Officer only)
 */
export async function getKYCReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reports = await dashboardService.getKYCReports(req.query);
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}
