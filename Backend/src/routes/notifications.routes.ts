// ============================================================
// Notification Routes
// User notification management
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";
import { Response, NextFunction } from "express";

const router = Router();

/**
 * GET /api/notifications
 * Get notifications for current user.
 */
router.get("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
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
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/mark-read
 * Mark notification(s) as read.
 */
router.post("/mark-read", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, all } = req.body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    }

    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications.
 */
router.get("/unread-count", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.userId, read: false },
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

export default router;