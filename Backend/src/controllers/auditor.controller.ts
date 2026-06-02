// ============================================================
// Auditor Controller
// Handles HTTP requests for all auditor operations
// ============================================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { auditorService } from "../services/auditor.service";

function asString(val: any): string | undefined {
  if (typeof val === "string") return val;
  return undefined;
}

export class AuditorController {
  // ---- AUTH ----

  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditorService.register(req.body);
      res.status(201).json({ success: true, message: "Auditor registered successfully", data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { officialEmail, password } = req.body;
      const ip = req.ip || req.socket.remoteAddress;
      const result = await auditorService.login(officialEmail, password, ip);
      res.json({ success: true, message: "Login successful", data: result });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await auditorService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await auditorService.logout(req.user!.userId, refreshToken);
      res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await auditorService.getProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fullName, phoneNumber, profileImage } = req.body;
      const profile = await auditorService.updateProfile(req.user!.userId, { fullName, phoneNumber, profileImage });
      res.json({ success: true, message: "Profile updated", data: profile });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await auditorService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
      next(err);
    }
  }

  // ---- VENDOR VERIFICATION ----

  async getVendors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await auditorService.getPendingVendors(page, limit, search);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getOfficers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await auditorService.getPendingOfficers(page, limit, search);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, remarks, userType } = req.body;
      const result = await auditorService.approveUser(req.user!.userId, userId, remarks, userType);
      res.json({ success: true, message: `${userType} approved successfully`, data: result });
    } catch (err) {
      next(err);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, remarks, userType } = req.body;
      const result = await auditorService.rejectUser(req.user!.userId, userId, remarks, userType);
      res.json({ success: true, message: `${userType} rejected`, data: result });
    } catch (err) {
      next(err);
    }
  }

  async blacklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, reason, userType, isPermanent } = req.body;
      const result = await auditorService.blacklistUser(req.user!.userId, userId, reason, userType, isPermanent);
      res.json({ success: true, message: `${userType} blacklisted`, data: result });
    } catch (err) {
      next(err);
    }
  }

  async requestReUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, remarks, userType } = req.body;
      const result = await auditorService.requestReUpload(req.user!.userId, userId, remarks, userType);
      res.json({ success: true, message: "Re-upload requested", data: result });
    } catch (err) {
      next(err);
    }
  }

  async flagSuspicious(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, reason, userType } = req.body;
      const result = await auditorService.flagSuspicious(req.user!.userId, userId, reason, userType);
      res.json({ success: true, message: "Account flagged as suspicious", data: result });
    } catch (err) {
      next(err);
    }
  }

  async addRemarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { verificationId, remarks } = req.body;
      const result = await auditorService.addRemarks(req.user!.userId, verificationId, remarks);
      res.json({ success: true, message: "Remarks added", data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---- ANALYTICS ----

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditorService.getAnalytics();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getFraudMonitoring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditorService.getFraudMonitoring();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---- BLACKLIST ----

  async getBlacklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await auditorService.getBlacklist(page, limit, search);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removeFromBlacklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entryId = req.params.entryId as string;
      const result = await auditorService.removeFromBlacklist(entryId);
      res.json({ success: true, message: "Removed from blacklist", data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---- NOTIFICATIONS ----

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await auditorService.getNotifications(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.notificationId as string;
      await auditorService.markNotificationRead(notificationId);
      res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
      next(err);
    }
  }

  async markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await auditorService.markAllNotificationsRead(req.user!.userId);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  }

  // ---- ACTIVITY LOGS ----

  async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const auditorId = req.query.auditorId as string;
      const result = await auditorService.getActivityLogs(auditorId, page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---- VERIFICATION QUEUES ----

  async getVerificationQueues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditorService.getVerificationQueues();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const auditorController = new AuditorController();