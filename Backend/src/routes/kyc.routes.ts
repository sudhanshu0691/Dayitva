// ============================================================
// KYC Routes
// Handles document upload and auditor verification workflow
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import * as kycController from "../controllers/kyc.controller";

const router = Router();

// Authenticated user routes
router.post("/submit", authenticate, kycController.submitKYC);
router.get("/status", authenticate, kycController.getKYCStatus);

// Auditor routes
router.get("/pending", authenticate, authorize("auditor"), kycController.getPendingKYC);
router.get("/all", authenticate, authorize("auditor"), kycController.getAllKYC);
router.post("/:requestId/approve", authenticate, authorize("auditor"), kycController.approveKYC);
router.post("/:requestId/reject", authenticate, authorize("auditor"), kycController.rejectKYC);

export default router;