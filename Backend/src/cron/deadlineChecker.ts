// ============================================================
// Tender Deadline Checker
// Runs periodically to auto-update expired tenders
// ============================================================

import { prisma } from "../config/database";
import { logger } from "../utils/logger";

/**
 * Check all open tenders and update statuses if deadline has passed.
 * This function should be called periodically via cron.
 */
export async function checkAndUpdateDeadlines(): Promise<{
  updated: number;
  details: Array<{ id: string; title: string; oldStatus: string; newStatus: string }>;
}> {
  const now = new Date();
  const details: Array<{ id: string; title: string; oldStatus: string; newStatus: string }> = [];

  try {
    // Find all Open tenders past their deadline
    const expiredTenders = await prisma.tender.findMany({
      where: {
        status: "Open",
        deadline: { lt: now },
      },
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        officerId: true,
      },
    });

    logger.info(`⏰ Deadline checker found ${expiredTenders.length} expired tenders`);

    for (const tender of expiredTenders) {
      // Check if there are any bids
      const bidCount = await prisma.bid.count({
        where: { tenderId: tender.id },
      });

      const newStatus = bidCount > 0 ? "UnderEvaluation" : "Closed";

      await prisma.tender.update({
        where: { id: tender.id },
        data: { status: newStatus },
      });

      // Add audit log
      await prisma.auditLog.create({
        data: {
          title: `Tender ${newStatus}`,
          description: `Tender deadline passed. Status auto-updated to ${newStatus}. ${bidCount} bids submitted.`,
          iconType: bidCount > 0 ? "evaluation" : "completed",
          tenderId: tender.id,
        },
      });

      // Create notification for officer
      await prisma.notification.create({
        data: {
          title: `Tender Deadline Passed: ${tender.title}`,
          message: `Tender "${tender.title}" deadline has passed. Status changed to ${newStatus}.`,
          category: "tender",
          actionUrl: `/tenders/${tender.id}`,
          officerId: tender.officerId,
        },
      });

      details.push({
        id: tender.id,
        title: tender.title,
        oldStatus: "Open",
        newStatus,
      });

      logger.info(`  → Tender ${tender.title}: Open → ${newStatus}`);
    }

    return { updated: expiredTenders.length, details };
  } catch (error: any) {
    logger.error("❌ Deadline checker failed:", { error: error.message });
    throw error;
  }
}

/**
 * Run once if called directly
 */
if (require.main === module) {
  checkAndUpdateDeadlines()
    .then((result) => {
      console.log(`✅ Deadline check complete: ${result.updated} tenders updated`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Deadline check failed:", err);
      process.exit(1);
    });
}