// ============================================================
// Route Aggregator
// Combines all route modules into a single router
// ============================================================

import { Router } from "express";
import authRoutes from "./auth.routes";
import tenderRoutes from "./tenders.routes";
import userRoutes from "./users.routes";
import notificationRoutes from "./notifications.routes";
import disputeRoutes from "./disputes.routes";
import dashboardRoutes from "./dashboard.routes";
import uploadRoutes from "./uploads.routes";

const router = Router();

/**
 * API Routes
 * All routes are prefixed with /api in app.ts
 */
router.use("/auth", authRoutes);
router.use("/tenders", tenderRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/disputes", disputeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Decentralized TenderChain API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;