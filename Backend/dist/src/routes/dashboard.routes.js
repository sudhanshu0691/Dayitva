"use strict";
// ============================================================
// Dashboard Routes
// All routes related to dashboards and reports
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
const dashboardController = __importStar(require("../controllers/dashboard.controller"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboard/officer
 * Get officer dashboard (Officer only)
 */
router.get("/officer", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), dashboardController.getOfficerDashboard);
/**
 * GET /api/dashboard/vendor
 * Get vendor dashboard (Vendor only)
 */
router.get("/vendor", auth_1.authenticate, (0, roleGuard_1.authorize)("vendor"), dashboardController.getVendorDashboard);
/**
 * GET /api/dashboard/analytics
 * Get system analytics (Admin only)
 */
router.get("/analytics", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), dashboardController.getAnalytics);
/**
 * GET /api/reports/tenders
 * Get tender reports
 */
router.get("/reports/tenders", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), dashboardController.getTenderReports);
/**
 * GET /api/reports/bids
 * Get bid reports
 */
router.get("/reports/bids", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), dashboardController.getBidReports);
/**
 * GET /api/reports/kyc
 * Get KYC reports (Officer only)
 */
router.get("/reports/kyc", auth_1.authenticate, (0, roleGuard_1.authorize)("officer"), dashboardController.getKYCReports);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map