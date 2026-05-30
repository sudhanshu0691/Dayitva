// ============================================================
// Dispute Service
// Business logic for dispute management
// ============================================================

import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const dispute = await prisma.dispute.create({
    data: {
      tenderId,
      userId,
      text,
    },
    include: {
      tender: {
        select: {
          title: true,
          ministry: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Notify officers about the dispute
  const officers = await prisma.user.findMany({
    where: { role: "officer" },
    select: { id: true },
  });

  for (const officer of officers) {
    await prisma.notification.create({
      data: {
        userId: officer.id,
        title: "New Dispute Raised",
        message: `A dispute has been raised for tender: ${tender.title}`,
        category: "system",
        actionUrl: `/disputes/${dispute.id}`,
      },
    });
  }

  logger.info(`Dispute created: ${dispute.id} for tender: ${tenderId}`);

  return dispute;
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  return dispute;
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
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return disputes;
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
    include: { user: true },
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Notify the user about dispute status update
  await prisma.notification.create({
    data: {
      userId: dispute.userId,
      title: `Dispute ${status}`,
      message: `Your dispute has been ${status.toLowerCase()}. ${resolution ? `Resolution: ${resolution}` : ""}`,
      category: "system",
      actionUrl: `/disputes/${disputeId}`,
    },
  });

  logger.info(`Dispute ${disputeId} status updated to: ${status}`);

  return updatedDispute;
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dispute.count({ where: whereClause }),
  ]);

  return {
    data: disputes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
