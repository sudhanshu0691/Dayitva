// ============================================================
// Dispute Service
// Business logic for dispute management
// Updated: Uses Vendor/Officer models and entityId/entityType on Dispute
// ============================================================

import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

/**
 * Find user in Vendor or Officer table and return enriched dispute info
 */
async function findUserById(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (vendor) return vendor;
  const officer = await prisma.officer.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  return officer;
}

/**
 * Create a new dispute
 */
export async function createDispute(
  tenderId: string,
  userId: string,
  text: string,
  category?: string
) {
  // Verify tender exists
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new AppError("Tender not found", 404);
  }

  // Verify user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const dispute = await prisma.dispute.create({
    data: {
      tenderId,
      entityId: userId,
      entityType: user.role,
      text,
    },
    include: {
      tender: {
        select: {
          title: true,
          ministry: true,
        },
      },
    },
  });

  // Enrich response with user data
  const result = { ...dispute, user };

  // Notify officers about the dispute
  const officers = await prisma.officer.findMany({
    select: { id: true },
  });

  for (const officer of officers) {
    await prisma.notification.create({
      data: {
        officerId: officer.id,
        title: "New Dispute Raised",
        message: `A dispute has been raised for tender: ${tender.title}`,
        category: "system",
        actionUrl: `/disputes/${dispute.id}`,
      },
    });
  }

  logger.info(`Dispute created: ${dispute.id} for tender: ${tenderId}`);

  return result;
}

/**
 * Get dispute by ID
 */
export async function getDisputeById(disputeId: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      tender: {
        select: {
          id: true,
          title: true,
          ministry: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  // Enrich with user data
  let user: any = null;
  if (dispute.entityId) {
    user = await findUserById(dispute.entityId);
  }

  return { ...dispute, user };
}

/**
 * Get disputes for a tender
 */
export async function getDisputesByTender(tenderId: string) {
  // Verify tender exists
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new AppError("Tender not found", 404);
  }

  const disputes = await prisma.dispute.findMany({
    where: { tenderId },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with user data
  const enriched = await Promise.all(
    disputes.map(async (d) => {
      let user: any = null;
      if (d.entityId) {
        user = await findUserById(d.entityId);
      }
      return { ...d, user };
    })
  );

  return enriched;
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: string,
  status: string,
  resolution: string
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  if (!["Open", "UnderReview", "Resolved", "Dismissed"].includes(status)) {
    throw new AppError("Invalid dispute status", 400);
  }

  const updatedDispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: status as any,
      updatedAt: new Date(),
    },
    include: {
      tender: {
        select: {
          title: true,
        },
      },
    },
  });

  // Notify the user about dispute status update
  if (dispute.entityId) {
    const notificationData: any = {
      title: `Dispute ${status}`,
      message: `Your dispute has been ${status.toLowerCase()}. ${resolution ? `Resolution: ${resolution}` : ""}`,
      category: "system",
      actionUrl: `/disputes/${disputeId}`,
    };

    // Try to determine if vendor or officer
    const vendor = await prisma.vendor.findUnique({ where: { id: dispute.entityId } });
    if (vendor) {
      notificationData.vendorId = dispute.entityId;
    } else {
      notificationData.officerId = dispute.entityId;
    }

    await prisma.notification.create({ data: notificationData });
  }

  // Enrich with user data
  let user: any = null;
  if (dispute.entityId) {
    user = await findUserById(dispute.entityId);
  }

  logger.info(`Dispute ${disputeId} status updated to: ${status}`);

  return { ...updatedDispute, user };
}

/**
 * List disputes with filters
 */
export async function listDisputes(query: any) {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const status = query.status;
  const tenderId = query.tenderId;

  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (tenderId) whereClause.tenderId = tenderId;

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where: whereClause,
      include: {
        tender: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dispute.count({ where: whereClause }),
  ]);

  // Enrich with user data
  const enriched = await Promise.all(
    disputes.map(async (d) => {
      let user: any = null;
      if (d.entityId) {
        user = await findUserById(d.entityId);
      }
      return { ...d, user };
    })
  );

  return {
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}