// ============================================================
// Dashboard Routes
// All routes related to dashboards and reports
// ============================================================

import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";

const router = Router();

/**
 * GET /api/dashboard/officer
 * Get officer dashboard (Officer only)
 */
router.get(
  "/officer",
  authenticate,
  authorize("officer"),
  dashboardController.getOfficerDashboard
);

/**
 * GET /api/dashboard/vendor
 * Get vendor dashboard (Vendor only)
 */
router.get(
  "/vendor",
  authenticate,
  authorize("vendor"),
  dashboardController.getVendorDashboard
);

/**
 * GET /api/dashboard/analytics
 * Get system analytics (Admin only)
 */
router.get(
  "/analytics",
  authenticate,
  authorize("officer"),
  dashboardController.getAnalytics
);

/**
 * GET /api/reports/tenders
 * Get tender reports
 */
router.get(
  "/reports/tenders",
  authenticate,
  authorize("officer"),
  dashboardController.getTenderReports
);

/**
 * GET /api/reports/bids
 * Get bid reports
 */
router.get(
  "/reports/bids",
  authenticate,
  authorize("officer"),
  dashboardController.getBidReports
);

/**
 * GET /api/reports/kyc
 * Get KYC reports (Officer only)
 */
router.get(
  "/reports/kyc",
  authenticate,
  authorize("officer"),
  dashboardController.getKYCReports
);

export default router;
