// ============================================================
// KYC Service
// Handles KYC document submission, verification workflow,
// and Auditor approval/rejection
// Updated: Uses VendorKYCRequest/OfficerKYCRequest models
// ============================================================

import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { getIO } from "./socket.service";
import { checkForFraud } from "./fraud.service";

export async function submitKYC(
  userId: string,
  userType: string,
  documents: string[],
  documentTypes: string[]
) {
  let user: any;
  if (userType === "vendor") {
    user = await prisma.vendor.findUnique({ where: { id: userId } });
  } else {
    user = await prisma.officer.findUnique({ where: { id: userId } });
  }
  if (!user) throw new Error("User not found");

  // Update KYC status
  if (userType === "vendor") {
    await prisma.vendor.update({
      where: { id: userId },
      data: {
        kycStatus: "UnderReview",
        kycDocuments: JSON.stringify(documents),
        kycSubmittedAt: new Date(),
      },
    });
  } else {
    await prisma.officer.update({
      where: { id: userId },
      data: {
        kycStatus: "UnderReview",
        kycDocuments: JSON.stringify(documents),
        kycSubmittedAt: new Date(),
      },
    });
  }

  // Create KYC request record in appropriate table
  if (userType === "vendor") {
    const existingRequest = await prisma.vendorKYCRequest.findFirst({
      where: { vendorId: userId, status: { in: ["Pending", "UnderReview" as any] } },
      orderBy: { createdAt: "desc" },
    });

    if (existingRequest) {
      await prisma.vendorKYCRequest.update({
        where: { id: existingRequest.id },
        data: {
          documents: JSON.stringify(documents),
          documentTypes: JSON.stringify(documentTypes),
          status: "Pending",
          remarks: null,
          reviewedById: null,
          reviewedAt: null,
          submissionCount: { increment: 1 },
        },
      });
    } else {
      await prisma.vendorKYCRequest.create({
        data: {
          vendorId: userId,
          documents: JSON.stringify(documents),
          documentTypes: JSON.stringify(documentTypes),
          status: "Pending",
        },
      });
    }
  } else {
    const existingRequest = await prisma.officerKYCRequest.findFirst({
      where: { officerId: userId, status: { in: ["Pending", "UnderReview" as any] } },
      orderBy: { createdAt: "desc" },
    });

    if (existingRequest) {
      await prisma.officerKYCRequest.update({
        where: { id: existingRequest.id },
        data: {
          documents: JSON.stringify(documents),
          documentTypes: JSON.stringify(documentTypes),
          status: "Pending",
          remarks: null,
          reviewedById: null,
          reviewedAt: null,
          submissionCount: { increment: 1 },
        },
      });
    } else {
      await prisma.officerKYCRequest.create({
        data: {
          officerId: userId,
          documents: JSON.stringify(documents),
          documentTypes: JSON.stringify(documentTypes),
          status: "Pending",
        },
      });
    }
  }

  // Run fraud detection checks
  await checkForFraud(userId, userType);

  // Notify all auditors about new KYC submission
  const io = getIO();
  const auditors = await prisma.auditor.findMany({ where: { isActive: true } });
  for (const auditor of auditors) {
    io.to(`auditor:${auditor.id}`).emit("kyc:new_submission", {
      userId,
      userType,
      userName: user.name,
      userEmail: user.email,
    });

    // Create notification for auditor
    await prisma.auditorNotification.create({
      data: {
        auditorId: auditor.id,
        title: "New KYC Submission",
        message: `${user.name} (${user.email}) has submitted KYC documents as ${userType}.`,
        type: "new_verification",
        actionUrl: `/auditor/${userType === "vendor" ? "vendors" : "officers"}`,
      },
    });
  }

  logger.info(`📄 KYC submitted for user ${userId} as ${userType}`);
  return { success: true, status: "UnderReview" };
}

export async function getKYCStatus(userId: string) {
  let user: any;
  let kycRequests: any[] = [];

  const vendor = await prisma.vendor.findUnique({
    where: { id: userId },
    select: {
      kycStatus: true,
      kycDocuments: true,
      kycRemarks: true,
      kycReviewedBy: true,
      kycReviewedAt: true,
      kycSubmittedAt: true,
    },
  });

  if (vendor) {
    user = vendor;
    kycRequests = await prisma.vendorKYCRequest.findMany({
      where: { vendorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        reviewedBy: {
          select: { fullName: true, officialEmail: true },
        },
      },
    });
  } else {
    const officer = await prisma.officer.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycDocuments: true,
        kycRemarks: true,
        kycReviewedBy: true,
        kycReviewedAt: true,
        kycSubmittedAt: true,
      },
    });
    if (officer) {
      user = officer;
      kycRequests = await prisma.officerKYCRequest.findMany({
        where: { officerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          reviewedBy: {
            select: { fullName: true, officialEmail: true },
          },
        },
      });
    }
  }

  return { ...user, kycRequests };
}

export async function getPendingKYCRequests() {
  const [vendorRequests, officerRequests] = await Promise.all([
    prisma.vendorKYCRequest.findMany({
      where: { status: "Pending" },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            pan: true,
            gst: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.officerKYCRequest.findMany({
      where: { status: "Pending" },
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            ministry: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map to unified format
  const mappedVendor = vendorRequests.map((r: any) => ({
    id: r.id,
    userId: r.vendor?.id,
    userName: r.vendor?.name,
    userEmail: r.vendor?.email,
    userType: "vendor",
    companyName: r.vendor?.companyName,
    pan: r.vendor?.pan,
    gst: r.vendor?.gst,
    documents: r.documents,
    documentTypes: r.documentTypes,
    status: r.status,
    remarks: r.remarks,
    submissionCount: r.submissionCount,
    createdAt: r.createdAt,
    reviewedBy: r.reviewedBy,
  }));

  const mappedOfficer = officerRequests.map((r: any) => ({
    id: r.id,
    userId: r.officer?.id,
    userName: r.officer?.name,
    userEmail: r.officer?.email,
    userType: "officer",
    designation: r.officer?.designation,
    ministry: r.officer?.ministry,
    documents: r.documents,
    documentTypes: r.documentTypes,
    status: r.status,
    remarks: r.remarks,
    submissionCount: r.submissionCount,
    createdAt: r.createdAt,
    reviewedBy: r.reviewedBy,
  }));

  return [...mappedVendor, ...mappedOfficer].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getAllKYCRequests(status?: string) {
  const vendorWhere: any = {};
  const officerWhere: any = {};
  if (status) {
    vendorWhere.status = status;
    officerWhere.status = status;
  }

  const [vendorRequests, officerRequests] = await Promise.all([
    prisma.vendorKYCRequest.findMany({
      where: vendorWhere,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            companyName: true,
            pan: true,
            gst: true,
            kycStatus: true,
          },
        },
        reviewedBy: {
          select: { fullName: true, officialEmail: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.officerKYCRequest.findMany({
      where: officerWhere,
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            designation: true,
            ministry: true,
            kycStatus: true,
          },
        },
        reviewedBy: {
          select: { fullName: true, officialEmail: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [...vendorRequests, ...officerRequests];
}

export async function approveKYC(
  requestId: string,
  auditorId: string,
  remarks?: string,
  userType?: string
) {
  let request: any;

  // Try vendor KYC request first
  request = await prisma.vendorKYCRequest.findUnique({
    where: { id: requestId },
    include: { vendor: true },
  });

  if (!request) {
    request = await prisma.officerKYCRequest.findUnique({
      where: { id: requestId },
      include: { officer: true },
    });
  }

  if (!request) throw new Error("KYC request not found");

  const isVendor = !!request.vendor;
  const user = request.vendor || request.officer;
  const entityType = isVendor ? "vendor" : "officer";

  // Update KYC request
  if (isVendor) {
    await prisma.vendorKYCRequest.update({
      where: { id: requestId },
      data: {
        status: "Approved",
        remarks: remarks || null,
        reviewedById: auditorId,
        reviewedAt: new Date(),
      },
    });
    // Update vendor KYC status
    await prisma.vendor.update({
      where: { id: request.vendorId },
      data: {
        kycStatus: "Approved",
        kycRemarks: remarks || null,
        kycReviewedBy: auditorId,
        kycReviewedAt: new Date(),
      },
    });
  } else {
    await prisma.officerKYCRequest.update({
      where: { id: requestId },
      data: {
        status: "Approved",
        remarks: remarks || null,
        reviewedById: auditorId,
        reviewedAt: new Date(),
      },
    });
    // Update officer KYC status
    await prisma.officer.update({
      where: { id: request.officerId },
      data: {
        kycStatus: "Approved",
        kycRemarks: remarks || null,
        kycReviewedBy: auditorId,
        kycReviewedAt: new Date(),
      },
    });
  }

  // Create verification record
  await prisma.verification.create({
    data: {
      entityId: user.id,
      entityType,
      status: "Approved",
      remarks: remarks || null,
      reviewedById: auditorId,
      verificationDate: new Date(),
    },
  });

  // Log auditor activity
  await prisma.auditorActivityLog.create({
    data: {
      auditorId,
      actionType: "APPROVE_KYC",
      description: `Approved KYC for ${user.name} (${entityType})`,
      targetId: user.id,
      targetType: entityType,
      metadata: JSON.stringify({ requestId, remarks }),
    },
  });

  // Notify user
  const io = getIO();
  io.to(`user:${user.id}`).emit("kyc:approved", {
    status: "Approved",
    remarks: remarks || null,
  });

  // Create notification for user
  const notificationData: any = {
    title: "KYC Approved",
    message: `Your KYC has been approved${remarks ? `. Remarks: ${remarks}` : ""}. You can now participate in the platform.`,
    category: "kyc",
    actionUrl: `/${entityType}/profile`,
  };
  if (isVendor) {
    notificationData.vendorId = user.id;
  } else {
    notificationData.officerId = user.id;
  }
  await prisma.notification.create({ data: notificationData });

  logger.info(`✅ KYC approved for user ${user.id}`);
  return { success: true, status: "Approved" };
}

export async function rejectKYC(
  requestId: string,
  auditorId: string,
  remarks: string
) {
  let request: any;

  request = await prisma.vendorKYCRequest.findUnique({
    where: { id: requestId },
    include: { vendor: true },
  });

  if (!request) {
    request = await prisma.officerKYCRequest.findUnique({
      where: { id: requestId },
      include: { officer: true },
    });
  }

  if (!request) throw new Error("KYC request not found");

  const isVendor = !!request.vendor;
  const user = request.vendor || request.officer;
  const entityType = isVendor ? "vendor" : "officer";

  // Update KYC request
  if (isVendor) {
    await prisma.vendorKYCRequest.update({
      where: { id: requestId },
      data: {
        status: "Rejected",
        remarks,
        reviewedById: auditorId,
        reviewedAt: new Date(),
      },
    });
    await prisma.vendor.update({
      where: { id: request.vendorId },
      data: {
        kycStatus: "Rejected",
        kycRemarks: remarks,
        kycReviewedBy: auditorId,
        kycReviewedAt: new Date(),
      },
    });
  } else {
    await prisma.officerKYCRequest.update({
      where: { id: requestId },
      data: {
        status: "Rejected",
        remarks,
        reviewedById: auditorId,
        reviewedAt: new Date(),
      },
    });
    await prisma.officer.update({
      where: { id: request.officerId },
      data: {
        kycStatus: "Rejected",
        kycRemarks: remarks,
        kycReviewedBy: auditorId,
        kycReviewedAt: new Date(),
      },
    });
  }

  // Create verification record
  await prisma.verification.create({
    data: {
      entityId: user.id,
      entityType,
      status: "Rejected",
      remarks,
      reviewedById: auditorId,
      verificationDate: new Date(),
    },
  });

  // Log auditor activity
  await prisma.auditorActivityLog.create({
    data: {
      auditorId,
      actionType: "REJECT_KYC",
      description: `Rejected KYC for ${user.name} (${entityType})`,
      targetId: user.id,
      targetType: entityType,
      metadata: JSON.stringify({ requestId, remarks }),
    },
  });

  // Check for fraud (multiple rejections)
  let rejectCount = 0;
  if (isVendor) {
    rejectCount = await prisma.vendorKYCRequest.count({
      where: { vendorId: user.id as string, status: "Rejected" },
    });
  } else {
    rejectCount = await prisma.officerKYCRequest.count({
      where: { officerId: user.id as string, status: "Rejected" },
    });
  }
  if (rejectCount >= 3) {
    await prisma.fraudFlag.create({
      data: {
        entityId: user.id,
        entityType,
        flagType: "MULTIPLE_REJECTIONS",
        severity: "High",
        status: "Open",
        description: `User has ${rejectCount} rejected KYC attempts`,
        evidence: JSON.stringify({ rejectCount, lastRequestId: requestId }),
        detectedBy: "system",
      },
    });
  }

  // Notify user
  const io = getIO();
  io.to(`user:${user.id}`).emit("kyc:rejected", {
    status: "Rejected",
    remarks,
  });

  const notificationData: any = {
    title: "KYC Rejected",
    message: `Your KYC has been rejected. Remarks: ${remarks}. Please upload corrected documents.`,
    category: "kyc",
    actionUrl: `/${entityType}/profile`,
  };
  if (isVendor) {
    notificationData.vendorId = user.id;
  } else {
    notificationData.officerId = user.id;
  }
  await prisma.notification.create({ data: notificationData });

  logger.info(`❌ KYC rejected for user ${user.id}`);
  return { success: true, status: "Rejected" };
}

export async function checkKYCApproved(userId: string): Promise<boolean> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });
  if (vendor) return vendor.kycStatus === "Approved";

  const officer = await prisma.officer.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });
  return officer?.kycStatus === "Approved";
}