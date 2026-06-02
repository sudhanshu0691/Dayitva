// ============================================================
// Fraud Detection Service
// Monitors for suspicious activities: duplicate PAN/GST,
// multiple rejections, fake identities, etc.
// Updated: Uses independent Vendor model
// ============================================================

import { prisma } from "../config/database";
import { logger } from "../utils/logger";

/**
 * Run fraud detection checks when KYC is submitted
 */
export async function checkForFraud(userId: string, userType: string): Promise<void> {
  try {
    let user: any;
    if (userType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: userId } });
    }
    if (!user) return;

    const fraudChecks = [
      checkDuplicatePAN(user, userType),
      checkDuplicateGST(user, userType),
      checkSuspiciousPatterns(user, userType),
    ];

    const results = await Promise.allSettled(fraudChecks);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Fraud check failed:", { error: result.reason });
      }
    }
  } catch (error) {
    logger.error("Fraud detection error:", { error });
  }
}

/**
 * Check if PAN is duplicate across vendors
 */
async function checkDuplicatePAN(user: any, userType: string): Promise<void> {
  if (!user.pan) return;

  const duplicates = await prisma.vendor.findMany({
    where: {
      pan: user.pan,
      id: { not: user.id },
    },
    select: { id: true, name: true, email: true },
  });

  if (duplicates.length > 0) {
    // Create fraud flag
    await prisma.fraudFlag.create({
      data: {
        entityId: user.id,
        entityType: userType,
        flagType: "DUPLICATE_PAN",
        severity: "Critical",
        status: "Open",
        description: `Duplicate PAN (${user.pan}) found across ${duplicates.length + 1} users`,
        evidence: JSON.stringify({
          pan: user.pan,
          currentUser: { id: user.id, name: user.name },
          duplicateUsers: duplicates,
        }),
        detectedBy: "system",
      },
    });

    // Flag all users with this PAN
    for (const dup of duplicates) {
      await prisma.fraudFlag.create({
        data: {
          entityId: dup.id,
          entityType: userType,
          flagType: "DUPLICATE_PAN",
          severity: "Critical",
          status: "Open",
          description: `Duplicate PAN (${user.pan}) found across multiple accounts`,
          evidence: JSON.stringify({
            pan: user.pan,
            linkedUser: { id: user.id, name: user.name },
          }),
          detectedBy: "system",
        },
      });
    }

    logger.warn(`🚨 Duplicate PAN detected: ${user.pan}`);
  }
}

/**
 * Check if GST is duplicate across vendors
 */
async function checkDuplicateGST(user: any, userType: string): Promise<void> {
  if (!user.gst) return;

  const duplicates = await prisma.vendor.findMany({
    where: {
      gst: user.gst,
      id: { not: user.id },
    },
    select: { id: true, name: true, email: true },
  });

  if (duplicates.length > 0) {
    await prisma.fraudFlag.create({
      data: {
        entityId: user.id,
        entityType: userType,
        flagType: "DUPLICATE_GST",
        severity: "Critical",
        status: "Open",
        description: `Duplicate GST (${user.gst}) found across ${duplicates.length + 1} users`,
        evidence: JSON.stringify({
          gst: user.gst,
          currentUser: { id: user.id, name: user.name },
          duplicateUsers: duplicates,
        }),
        detectedBy: "system",
      },
    });

    logger.warn(`🚨 Duplicate GST detected: ${user.gst}`);
  }
}

/**
 * Check for suspicious patterns
 */
async function checkSuspiciousPatterns(user: any, userType: string): Promise<void> {
  const suspiciousIndicators: string[] = [];

  // Check for rapid registration patterns (IP based for vendors)
  if (user.ipAddress) {
    const recentUsers = await prisma.vendor.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        ipAddress: user.ipAddress,
        id: { not: user.id },
      },
      select: { id: true },
    });

    if (recentUsers.length > 3) {
      suspiciousIndicators.push(`Multiple users (${recentUsers.length + 1}) from same IP in 24 hours`);
    }
  }

  // Check for missing critical fields
  if (!user.email || !user.mobile) {
    suspiciousIndicators.push("Missing critical contact information");
  }

  // Check for mismatched data
  if (user.pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(user.pan)) {
      suspiciousIndicators.push(`Invalid PAN format: ${user.pan}`);
    }
  }

  if (suspiciousIndicators.length > 0) {
    await prisma.fraudFlag.create({
      data: {
        entityId: user.id,
        entityType: userType,
        flagType: "SUSPICIOUS_PATTERN",
        severity: "Medium",
        status: "Open",
        description: suspiciousIndicators.join("; "),
        evidence: JSON.stringify({ indicators: suspiciousIndicators }),
        detectedBy: "system",
      },
    });

    logger.warn(`🚨 Suspicious pattern detected for user ${user.id}: ${suspiciousIndicators.join(", ")}`);
  }
}

/**
 * Get all fraud flags
 */
export async function getFraudFlags(status?: string) {
  const where: any = {};
  if (status) where.status = status;

  const flags = await prisma.fraudFlag.findMany({
    where,
    include: {
      resolvedBy: {
        select: { fullName: true },
      },
    },
    orderBy: { detectedAt: "desc" },
  });

  // Enrich with user data
  const enriched = await Promise.all(flags.map(async (f) => {
    let user: any = null;
    if (f.entityType === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: f.entityId }, select: { id: true, name: true, email: true, companyName: true, pan: true, gst: true } });
    } else {
      user = await prisma.officer.findUnique({ where: { id: f.entityId }, select: { id: true, name: true, email: true, designation: true } });
    }
    return { ...f, user };
  }));

  return enriched;
}

/**
 * Get fraud stats for dashboard
 */
export async function getFraudStats() {
  const total = await prisma.fraudFlag.count();
  const open = await prisma.fraudFlag.count({ where: { status: "Open" } });
  const investigating = await prisma.fraudFlag.count({ where: { status: "Investigating" } });
  const confirmed = await prisma.fraudFlag.count({ where: { status: "Confirmed" } });
  const dismissed = await prisma.fraudFlag.count({ where: { status: "Dismissed" } });
  const critical = await prisma.fraudFlag.count({ where: { severity: "Critical", status: { not: "Dismissed" } } });
  const high = await prisma.fraudFlag.count({ where: { severity: "High", status: { not: "Dismissed" } } });

  return { total, open, investigating, confirmed, dismissed, critical, high };
}

/**
 * Resolve a fraud flag
 */
export async function resolveFraudFlag(
  flagId: string,
  status: string,
  auditorId: string,
  remarks?: string
) {
  const flag = await prisma.fraudFlag.update({
    where: { id: flagId },
    data: {
      status: status as any,
      resolvedById: auditorId,
      resolvedAt: new Date(),
      description: remarks ? `${flagId}: ${remarks}` : undefined,
    },
  });

  await prisma.auditorActivityLog.create({
    data: {
      auditorId,
      actionType: "FRAUD_REVIEW",
      description: `Resolved fraud flag ${flagId} as ${status}`,
      targetId: flag.entityId,
      targetType: "fraud",
      metadata: JSON.stringify({ flagId, status, remarks }),
    },
  });

  return flag;
}