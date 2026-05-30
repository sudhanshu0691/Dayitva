"use strict";
// ============================================================
// Route Aggregator
// Combines all route modules into a single router
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const tenders_routes_1 = __importDefault(require("./tenders.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const notifications_routes_1 = __importDefault(require("./notifications.routes"));
const disputes_routes_1 = __importDefault(require("./disputes.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const uploads_routes_1 = __importDefault(require("./uploads.routes"));
const router = (0, express_1.Router)();
/**
 * API Routes
 * All routes are prefixed with /api in app.ts
 */
router.use("/auth", auth_routes_1.default);
router.use("/tenders", tenders_routes_1.default);
router.use("/users", users_routes_1.default);
router.use("/notifications", notifications_routes_1.default);
router.use("/disputes", disputes_routes_1.default);
router.use("/dashboard", dashboard_routes_1.default);
router.use("/uploads", uploads_routes_1.default);
// Health check
router.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "Decentralized TenderChain API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map