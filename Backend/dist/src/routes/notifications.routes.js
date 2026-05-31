"use strict";
// ============================================================
// Notification Routes
// User notification management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
/**
 * GET /api/notifications
 * Get notifications for current user.
 */
router.get("/", auth_1.authenticate, async (req, res, next) => {
    try {
        const notifications = await database_1.prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        res.json({
            success: true,
            data: notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                category: n.category,
                read: n.read,
                timestamp: n.createdAt.toISOString(),
                actionUrl: n.actionUrl || undefined,
            })),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/notifications/mark-read
 * Mark notification(s) as read.
 */
router.post("/mark-read", auth_1.authenticate, async (req, res, next) => {
    try {
        const { id, all } = req.body;
        if (all) {
            await database_1.prisma.notification.updateMany({
                where: { userId: req.user.userId },
                data: { read: true },
            });
        }
        else if (id) {
            await database_1.prisma.notification.update({
                where: { id },
                data: { read: true },
            });
        }
        res.json({ success: true, message: "Notifications marked as read" });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications.
 */
router.get("/unread-count", auth_1.authenticate, async (req, res, next) => {
    try {
        const count = await database_1.prisma.notification.count({
            where: { userId: req.user.userId, read: false },
        });
        res.json({ success: true, data: { unreadCount: count } });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/notifications/:id
 * Delete a single notification by ID.
 */
router.delete("/:id", auth_1.authenticate, async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        if (notification.userId !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
        }
        await database_1.prisma.notification.delete({ where: { id: notificationId } });
        res.json({ success: true, message: "Notification deleted" });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/notifications
 * Delete all notifications for current user.
 */
router.delete("/", auth_1.authenticate, async (req, res, next) => {
    try {
        await database_1.prisma.notification.deleteMany({
            where: { userId: req.user.userId },
        });
        res.json({ success: true, message: "All notifications deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map