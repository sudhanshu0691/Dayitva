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
    const myId = req.user!.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId: myId },
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
    const myId = req.user!.userId;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: myId },
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
    const myId = req.user!.userId;
    const count = await prisma.notification.count({
      where: { userId: myId, read: false },
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification by ID.
 */
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notificationId = req.params.id as string;
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
    }

    await prisma.notification.delete({ where: { id: notificationId } });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for current user.
 */
router.delete("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user!.userId },
    });
    res.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;