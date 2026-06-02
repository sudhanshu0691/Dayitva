// ============================================================
// Auditor Routes
// All auditor-related API endpoints
// ============================================================

import { Router } from "express";
import { auditorController } from "../controllers/auditor.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";

const router = Router();

// ---- Public routes (no auth required) ----
router.post("/register", auditorController.register.bind(auditorController));
router.post("/login", auditorController.login.bind(auditorController));
router.post("/refresh", auditorController.refreshToken.bind(auditorController));

// ---- Protected routes (auth required) ----
router.use(authenticate);
router.use(authorize("auditor"));

// Profile
router.get("/profile", auditorController.getProfile.bind(auditorController));
router.put("/profile", auditorController.updateProfile.bind(auditorController));
router.post("/change-password", auditorController.changePassword.bind(auditorController));
router.post("/logout", auditorController.logout.bind(auditorController));

// Vendor verification
router.get("/vendors", auditorController.getVendors.bind(auditorController));
router.get("/officers", auditorController.getOfficers.bind(auditorController));

// Verification actions
router.post("/approve", auditorController.approve.bind(auditorController));
router.post("/reject", auditorController.reject.bind(auditorController));
router.post("/blacklist", auditorController.blacklist.bind(auditorController));
router.post("/reupload", auditorController.requestReUpload.bind(auditorController));
router.post("/flag-suspicious", auditorController.flagSuspicious.bind(auditorController));
router.post("/remarks", auditorController.addRemarks.bind(auditorController));

// Analytics & Monitoring
router.get("/analytics", auditorController.getAnalytics.bind(auditorController));
router.get("/fraud-monitoring", auditorController.getFraudMonitoring.bind(auditorController));

// Blacklist management
router.get("/blacklist", auditorController.getBlacklist.bind(auditorController));
router.delete("/blacklist/:entryId", auditorController.removeFromBlacklist.bind(auditorController));

// Notifications
router.get("/notifications", auditorController.getNotifications.bind(auditorController));
router.put("/notifications/:notificationId/read", auditorController.markNotificationRead.bind(auditorController));
router.put("/notifications/read-all", auditorController.markAllNotificationsRead.bind(auditorController));

// Activity logs
router.get("/logs", auditorController.getActivityLogs.bind(auditorController));

// Verification queues
router.get("/queues", auditorController.getVerificationQueues.bind(auditorController));

export default router;