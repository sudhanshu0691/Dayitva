// Auditor Service
// Handles all auditor business logic: verification, blacklist,
// analytics, activity logging
// Updated: Uses independent Vendor and Officer models
// ============================================================

import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

export class AuditorService {
  // ---- AUTH ----

  async register(data: {
    fullName: string;
    officialEmail: string;
    employeeId: string;
    department: string;
    phoneNumber?: string;
    password: string;
  }) {
    const existing = await prisma.auditor.findFirst({
      where: {
        OR: [
          { officialEmail: data.officialEmail },
          { employeeId: data.employeeId },
        ],
      },
    });
    if (existing) {
      throw new AppError("Auditor with this email or employee ID already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const auditor = await prisma.auditor.create({
      data: {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
        employeeId: data.employeeId,
        department: data.department,
        phoneNumber: data.phoneNumber,
        passwordHash,
      },
    });

    await this.logActivity(auditor.id, "REGISTER", "Auditor account created");

    return { id: auditor.id, fullName: auditor.fullName, officialEmail: auditor.officialEmail };
  }

  async login(officialEmail: string, password: string, ipAddress?: string) {
    const auditor = await prisma.auditor.findUnique({ where: { officialEmail } });
    if (!auditor) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!auditor.isActive) {
      throw new AppError("Auditor account is deactivated. Contact super admin.", 403);
    }

    const valid = await bcrypt.compare(password, auditor.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = generateTokenPair({ userId: auditor.id, role: "auditor" });

    // Store refresh token
    await prisma.auditorRefreshToken.create({
      data: {
        token: tokens.refreshToken,
        auditorId: auditor.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.auditor.update({
      where: { id: auditor.id },
      data: { lastLogin: new Date() },
    });

    await this.logActivity(auditor.id, "LOGIN", "Auditor logged in", undefined, undefined, ipAddress);

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      auditor: {
        id: auditor.id,
        fullName: auditor.fullName,
        officialEmail: auditor.officialEmail,
        employeeId: auditor.employeeId,
        department: auditor.department,
        role: "auditor",
        profileImage: auditor.profileImage,
      },
    };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    const stored = await prisma.auditorRefreshToken.findUnique({
      where: { token },
      include: { auditor: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Delete old token
    await prisma.auditorRefreshToken.delete({ where: { id: stored.id } });

    const newTokens = generateTokenPair({ userId: decoded.userId, role: "auditor" });

    // Store new refresh token
    await prisma.auditorRefreshToken.create({
      data: {
        token: newTokens.refreshToken,
        auditorId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      token: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  async logout(auditorId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.auditorRefreshToken.deleteMany({ where: { token: refreshToken } });
    }
    await this.logActivity(auditorId, "LOGOUT", "Auditor logged out");
  }

  async getProfile(auditorId: string) {
    const auditor = await prisma.auditor.findUnique({
      where: { id: auditorId },
      select: {
        id: true,
        fullName: true,
        officialEmail: true,
        employeeId: true,
        department: true,
        phoneNumber: true,
        profileImage: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!auditor) throw new AppError("Auditor not found", 404);
    return auditor;
  }

  async updateProfile(auditorId: string, data: { fullName?: string; phoneNumber?: string; profileImage?: string }) {
    const auditor = await prisma.auditor.update({
      where: { id: auditorId },
      data,
      select: {
        id: true,
        fullName: true,
        officialEmail: true,
        employeeId: true,
        department: true,
        phoneNumber: true,
        profileImage: true,
      },
    });
    await this.logActivity(auditorId, "PROFILE_UPDATE", "Profile updated");
    return auditor;
  }

  async changePassword(auditorId: string, currentPassword: string, newPassword: string) {
    const auditor = await prisma.auditor.findUnique({ where: { id: auditorId } });
    if (!auditor) throw new AppError("Auditor not found", 404);

    const valid = await bcrypt.compare(currentPassword, auditor.passwordHash);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.auditor.update({
      where: { id: auditorId },
      data: { passwordHash },
    });
    await this.logActivity(auditorId, "PASSWORD_CHANGE", "Password changed");
  }

  // ---- VENDOR VERIFICATION ----

  async getPendingVendors(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
        { gst: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          pan: true,
          gst: true,
          regNumber: true,
          turnover: true,
          kycStatus: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.vendor.count({ where }),
    ]);

    return { vendors, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getPendingOfficers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { ministry: { contains: search, mode: "insensitive" } },
      ];
    }

    const [officers, total] = await Promise.all([
      prisma.officer.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          ministry: true,
          ministryCode: true,
          kycStatus: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.officer.count({ where }),
    ]);

    return { officers, total, page, totalPages: Math.ceil(total / limit) };
  }

  async approveUser(auditorId: string, userId: string, remarks: string, userType: "vendor" | "officer") {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) throw new AppError("User not found", 404);

    const verification = await prisma.verification.create({
      data: {
        entityId: userId,
        entityType: userType,
        status: "Approved",
        remarks,
        reviewedById: auditorId,
        verificationDate: new Date(),
      },
    });

    if (userType === "vendor") {
      await prisma.vendor.update({
        where: { id: userId },
        data: { kycStatus: "Approved" },
      });
    } else {
      await prisma.officer.update({
        where: { id: userId },
        data: { kycStatus: "Approved" },
      });
    }

    await this.logActivity(auditorId, "APPROVE", `Approved ${userType}: ${user.email}`, userId, userType);
    await this.createNotification(auditorId, "KYC Approved", `${userType} ${user.email} has been approved. Remarks: ${remarks}`, "approved");

    // Create user notification
    const notificationData: any = {
      title: "KYC Approved",
      message: `Your KYC has been approved by the auditor. Remarks: ${remarks}`,
      category: "kyc",
      actionUrl: "/dashboard",
    };
    if (userType === "vendor") {
      notificationData.vendorId = userId;
    } else {
      notificationData.officerId = userId;
    }
    await prisma.notification.create({ data: notificationData });

    return verification;
  }

  async rejectUser(auditorId: string, userId: string, remarks: string, userType: "vendor" | "officer") {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) throw new AppError("User not found", 404);

    const verification = await prisma.verification.create({
      data: {
        entityId: userId,
        entityType: userType,
        status: "Rejected",
        remarks,
        reviewedById: auditorId,
        verificationDate: new Date(),
      },
    });

    if (userType === "vendor") {
      await prisma.vendor.update({
        where: { id: userId },
        data: { kycStatus: "Rejected" },
      });
    } else {
      await prisma.officer.update({
        where: { id: userId },
        data: { kycStatus: "Rejected" },
      });
    }

    await this.logActivity(auditorId, "REJECT", `Rejected ${userType}: ${user.email}. Reason: ${remarks}`, userId, userType);
    await this.createNotification(auditorId, "KYC Rejected", `${userType} ${user.email} has been rejected. Remarks: ${remarks}`, "rejected");

    const notificationData: any = {
      title: "KYC Rejected",
      message: `Your KYC has been rejected. Remarks: ${remarks}`,
      category: "kyc",
      actionUrl: "/dashboard",
    };
    if (userType === "vendor") {
      notificationData.vendorId = userId;
    } else {
      notificationData.officerId = userId;
    }
    await prisma.notification.create({ data: notificationData });

    return verification;
  }

  async blacklistUser(auditorId: string, userId: string, reason: string, userType: "vendor" | "officer", isPermanent = false) {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) throw new AppError("User not found", 404);

    // Create blacklist entry
    await prisma.blacklistEntry.create({
      data: {
        entityId: userId,
        entityType: userType,
        reason,
        addedById: auditorId,
        isPermanent,
      },
    });

    // Update verification status
    await prisma.verification.create({
      data: {
        entityId: userId,
        entityType: userType,
        status: "Blacklisted",
        remarks: reason,
        blacklistStatus: true,
        reviewedById: auditorId,
        verificationDate: new Date(),
      },
    });

    if (userType === "vendor") {
      await prisma.vendor.update({
        where: { id: userId },
        data: { kycStatus: "Rejected" },
      });
    } else {
      await prisma.officer.update({
        where: { id: userId },
        data: { kycStatus: "Rejected" },
      });
    }

    await this.logActivity(auditorId, "BLACKLIST", `Blacklisted ${userType}: ${user.email}. Reason: ${reason}`, userId, userType);
    await this.createNotification(auditorId, "User Blacklisted", `${userType} ${user.email} has been blacklisted. Reason: ${reason}`, "blacklist");

    return { message: "User blacklisted successfully" };
  }

  async requestReUpload(auditorId: string, userId: string, remarks: string, userType: "vendor" | "officer") {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) throw new AppError("User not found", 404);

    const verification = await prisma.verification.create({
      data: {
        entityId: userId,
        entityType: userType,
        status: "ReVerificationRequired",
        remarks: `Re-upload requested: ${remarks}`,
        reviewedById: auditorId,
        reVerificationCount: 0,
      },
    });

    if (userType === "vendor") {
      await prisma.vendor.update({
        where: { id: userId },
        data: { kycStatus: "Pending" },
      });
    } else {
      await prisma.officer.update({
        where: { id: userId },
        data: { kycStatus: "Pending" },
      });
    }

    await this.logActivity(auditorId, "RE_UPLOAD_REQUEST", `Requested re-upload from ${userType}: ${user.email}`, userId, userType);
    await this.createNotification(auditorId, "Re-verification Required", `Requested document re-upload from ${userType} ${user.email}. Remarks: ${remarks}`, "reverify");

    const notificationData: any = {
      title: "Document Re-upload Required",
      message: `Please re-upload your KYC documents. Remarks: ${remarks}`,
      category: "kyc",
      actionUrl: "/dashboard",
    };
    if (userType === "vendor") {
      notificationData.vendorId = userId;
    } else {
      notificationData.officerId = userId;
    }
    await prisma.notification.create({ data: notificationData });

    return verification;
  }

  async flagSuspicious(auditorId: string, userId: string, reason: string, userType: "vendor" | "officer") {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) throw new AppError("User not found", 404);

    await prisma.verification.create({
      data: {
        entityId: userId,
        entityType: userType,
        status: "Suspicious",
        remarks: reason,
        isFraudFlagged: true,
        fraudReason: reason,
        reviewedById: auditorId,
        verificationDate: new Date(),
      },
    });

    await this.logActivity(auditorId, "FLAG_SUSPICIOUS", `Flagged ${userType} as suspicious: ${user.email}. Reason: ${reason}`, userId, userType);
    await this.createNotification(auditorId, "Suspicious Account Flagged", `${userType} ${user.email} flagged as suspicious. Reason: ${reason}`, "fraud");

    return { message: "User flagged as suspicious" };
  }

  async addRemarks(auditorId: string, verificationId: string, remarks: string) {
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: { remarks },
    });
    await this.logActivity(auditorId, "ADD_REMARKS", `Added remarks to verification ${verificationId}`, undefined, undefined);
    return verification;
  }

  // ---- DASHBOARD / ANALYTICS ----

  async getAnalytics() {
    const [totalVendors, totalOfficers, pendingV, approvedToday, rejectedCount, fraudCount, blacklistedCount, vendorVerifications, officerVerifications] = await Promise.all([
      prisma.vendor.count(),
      prisma.officer.count(),
      prisma.vendor.count({ where: { kycStatus: "Pending" } }),
      prisma.verification.count({
        where: {
          status: "Approved",
          verificationDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.verification.count({ where: { status: "Rejected" } }),
      prisma.verification.count({ where: { isFraudFlagged: true } }),
      prisma.blacklistEntry.count(),
      prisma.verification.count({ where: { entityType: "vendor" } }),
      prisma.verification.count({ where: { entityType: "officer" } }),
    ]);

    // Chart data: last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const dailyVerifications = await Promise.all(
      last7Days.map(async (date) => {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        const approved = await prisma.verification.count({
          where: { status: "Approved", verificationDate: { gte: start, lt: end } },
        });
        const rejected = await prisma.verification.count({
          where: { status: "Rejected", verificationDate: { gte: start, lt: end } },
        });
        return { date, approved, rejected };
      })
    );

    // Status distribution
    const statusDistribution = await prisma.verification.groupBy({
      by: ["status"],
      _count: true,
    });

    return {
      stats: {
        totalVendors,
        totalOfficers,
        pendingRequests: pendingV,
        approvedToday,
        totalRejected: rejectedCount,
        fraudAttempts: fraudCount,
        blacklistedUsers: blacklistedCount,
        vendorVerifications,
        officerVerifications,
      },
      chartData: {
        dailyVerifications,
        statusDistribution: statusDistribution.map((s: any) => ({ status: s.status, count: s._count })),
      },
    };
  }

  async getFraudMonitoring() {
    // Detect duplicate GST
    const vendors = await prisma.vendor.findMany({
      where: { gst: { not: null } },
      select: { gst: true, id: true, companyName: true, email: true },
    });
    const gstMap = new Map<string, any[]>();
    vendors.forEach((u: any) => {
      if (u.gst) {
        if (!gstMap.has(u.gst)) gstMap.set(u.gst, []);
        gstMap.get(u.gst)!.push(u);
      }
    });
    const duplicateGstEntries = Array.from(gstMap.entries()).filter(([, users]) => users.length > 1);

    // Detect duplicate PAN
    const vendPan = await prisma.vendor.findMany({
      where: { pan: { not: null } },
      select: { pan: true, id: true, companyName: true, email: true },
    });
    const panMap = new Map<string, any[]>();
    vendPan.forEach((u: any) => {
      if (u.pan) {
        if (!panMap.has(u.pan)) panMap.set(u.pan, []);
        panMap.get(u.pan)!.push(u);
      }
    });
    const duplicatePanEntries = Array.from(panMap.entries()).filter(([, users]) => users.length > 1);

    // Users with multiple KYC failures (3+ rejections)
    const multipleFailures = await prisma.verification.groupBy({
      by: ["entityId"],
      where: { status: "Rejected" },
      _count: true,
    });
    const seriousFailures = multipleFailures.filter((f: any) => f._count >= 3);

    // Flagged accounts
    const flaggedAccounts = await prisma.verification.findMany({
      where: { isFraudFlagged: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Enrich flagged accounts with user data
    const enrichedFlags = await Promise.all(flaggedAccounts.map(async (f) => {
      let user: any = null;
      if (f.entityType === "vendor") {
        user = await prisma.vendor.findUnique({ where: { id: f.entityId }, select: { id: true, name: true, email: true, companyName: true } });
      } else {
        user = await prisma.officer.findUnique({ where: { id: f.entityId }, select: { id: true, name: true, email: true, designation: true } });
      }
      return { ...f, user };
    }));

    return {
      duplicateGST: duplicateGstEntries,
      duplicatePAN: duplicatePanEntries,
      multipleKycFailures: seriousFailures.length,
      flaggedAccounts: enrichedFlags.map((f: any) => ({
        id: f.id,
        userId: f.entityId,
        name: f.user?.name,
        email: f.user?.email,
        companyName: f.user?.companyName,
        userType: f.entityType,
        fraudReason: f.fraudReason,
        flaggedAt: f.createdAt,
      })),
    };
  }

  async getBlacklist(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.blacklistEntry.findMany({
        where,
        include: {
          addedBy: { select: { id: true, fullName: true, officialEmail: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blacklistEntry.count({ where }),
    ]);

    // Enrich with user data
    const enriched = await Promise.all(entries.map(async (entry) => {
      let user: any = null;
      if (entry.entityType === "vendor") {
        user = await prisma.vendor.findUnique({ where: { id: entry.entityId }, select: { id: true, name: true, email: true, companyName: true, pan: true, gst: true, role: true } });
      } else {
        user = await prisma.officer.findUnique({ where: { id: entry.entityId }, select: { id: true, name: true, email: true, role: true } });
      }
      return { ...entry, user };
    }));

    return { entries: enriched, total, page, totalPages: Math.ceil(total / limit) };
  }

  async removeFromBlacklist(entryId: string) {
    await prisma.blacklistEntry.update({
      where: { id: entryId },
      data: { removedAt: new Date() },
    });
    return { message: "Removed from blacklist" };
  }

  // ---- NOTIFICATIONS ----

  async getNotifications(auditorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      prisma.auditorNotification.findMany({
        where: { auditorId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditorNotification.count({ where: { auditorId } }),
      prisma.auditorNotification.count({ where: { auditorId, read: false } }),
    ]);
    return { notifications, total, unread, page, totalPages: Math.ceil(total / limit) };
  }

  async markNotificationRead(notificationId: string) {
    await prisma.auditorNotification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllNotificationsRead(auditorId: string) {
    await prisma.auditorNotification.updateMany({
      where: { auditorId, read: false },
      data: { read: true },
    });
  }

  // ---- ACTIVITY LOGS ----

  async getActivityLogs(auditorId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (auditorId) where.auditorId = auditorId;

    const [logs, total] = await Promise.all([
      prisma.auditorActivityLog.findMany({
        where,
        include: {
          auditor: { select: { id: true, fullName: true, officialEmail: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditorActivityLog.count({ where }),
    ]);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ---- VERIFICATION QUEUES ----

  async getVerificationQueues() {
    const [normal, highPriority, fraudFlagged] = await Promise.all([
      prisma.verification.findMany({
        where: { status: "Pending", isFraudFlagged: false },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
      prisma.verification.findMany({
        where: { status: "Pending", reVerificationCount: { gte: 1 } },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
      prisma.verification.findMany({
        where: { isFraudFlagged: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Enrich with user data
    const enrichVerification = async (v: any) => {
      let user: any = null;
      if (v.entityType === "vendor") {
        user = await prisma.vendor.findUnique({ where: { id: v.entityId }, select: { id: true, name: true, email: true, companyName: true, role: true } });
      } else {
        user = await prisma.officer.findUnique({ where: { id: v.entityId }, select: { id: true, name: true, email: true, role: true, designation: true } });
      }
      return { ...v, user };
    };

    return {
      normal: await Promise.all(normal.map(enrichVerification)),
      highPriority: await Promise.all(highPriority.map(enrichVerification)),
      fraudFlagged: await Promise.all(fraudFlagged.map(enrichVerification)),
    };
  }

  // ---- INTERNAL HELPERS ----

  private async logActivity(auditorId: string, actionType: string, description?: string, targetId?: string, targetType?: string, ipAddress?: string) {
    try {
      await prisma.auditorActivityLog.create({
        data: { auditorId, actionType, description, targetId, targetType, ipAddress },
      });
    } catch (err) {
      logger.error("Failed to log auditor activity", { error: err });
    }
  }

  private async createNotification(auditorId: string, title: string, message: string, type: string) {
    try {
      await prisma.auditorNotification.create({
        data: { auditorId, title, message, type },
      });
    } catch (err) {
      logger.error("Failed to create auditor notification", { error: err });
    }
  }
}

export const auditorService = new AuditorService();