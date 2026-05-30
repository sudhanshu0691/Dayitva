// ============================================================
// User Service
// Handles user profile, KYC verification
// ============================================================

import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { UpdateProfileInput, KYCVerificationInput } from "../validators/user.validator";
import { IUserProfile } from "../types";

/**
 * Format user for API response.
 */
function formatUser(user: any): IUserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || undefined,
    role: user.role as IUserProfile["role"],
    walletAddress: user.walletAddress || undefined,
    kycStatus: user.kycStatus as IUserProfile["kycStatus"],
    companyName: user.companyName || undefined,
    regNumber: user.regNumber || undefined,
    pan: user.pan || undefined,
    gst: user.gst || undefined,
    turnover: user.turnover || undefined,
    itrYears: user.itrYears ? JSON.parse(user.itrYears) : undefined,
    solvencyCertificate: user.solvencyCertificate || undefined,
    experienceScore: user.experienceScore || undefined,
    designation: user.designation || undefined,
    ministry: user.ministry || undefined,
    ministryCode: user.ministryCode || undefined,
    permissions: user.permissions ? JSON.parse(user.permissions) : undefined,
    deviceInfo: user.deviceInfo || undefined,
    ipAddress: user.ipAddress || undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Update user profile.
 */
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.mobile !== undefined) updateData.mobile = input.mobile;
  if (input.companyName !== undefined) updateData.companyName = input.companyName;
  if (input.regNumber !== undefined) updateData.regNumber = input.regNumber;
  if (input.pan !== undefined) updateData.pan = input.pan;
  if (input.gst !== undefined) updateData.gst = input.gst;
  if (input.turnover !== undefined) updateData.turnover = input.turnover;
  if (input.itrYears !== undefined) updateData.itrYears = JSON.stringify(input.itrYears);
  if (input.designation !== undefined) updateData.designation = input.designation;
  if (input.ministry !== undefined) updateData.ministry = input.ministry;
  if (input.ministryCode !== undefined) updateData.ministryCode = input.ministryCode;
  if (input.permissions !== undefined) updateData.permissions = JSON.stringify(input.permissions);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return formatUser(updated);
}

/**
 * KYC verification (Officer only).
 */
export async function verifyKYC(vendorId: string, input: KYCVerificationInput, officerId: string) {
  const vendor = await prisma.user.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new AppError("Vendor not found", 404);
  if (vendor.role !== "vendor") throw new AppError("User is not a vendor", 400);

  const updated = await prisma.user.update({
    where: { id: vendorId },
    data: { kycStatus: input.status as any },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      title: "KYC Status Update",
      message: `Your KYC has been ${input.status}${input.feedback ? `. Feedback: ${input.feedback}` : ""}`,
      category: "kyc",
      actionUrl: "/vendor/profile",
      userId: vendorId,
    },
  });

  // Create blockchain transaction record
  await prisma.blockchainTx.create({
    data: {
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      blockNumber: Math.floor(Math.random() * 50000) + 18240000,
      timestamp: new Date(),
      walletAddress: vendor.walletAddress || "",
      type: "KYC_APPROVED",
      status: "success",
      metadata: JSON.stringify({ vendorId, status: input.status, officerId }),
      userId: vendorId,
    },
  });

  return formatUser(updated);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  return formatUser(user);
}

/**
 * Get KYC status
 */
export async function getKYCStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kycStatus: true,
      pan: true,
      gst: true,
      solvencyCertificate: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
}

/**
 * Submit KYC documents
 */
export async function submitKYC(userId: string, kycData: any) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "vendor") throw new AppError("Only vendors can submit KYC", 403);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      pan: kycData.pan,
      gst: kycData.gst,
      solvencyCertificate: kycData.solvencyCertificate,
      regNumber: kycData.regNumber,
      companyName: kycData.companyName,
      kycStatus: "UnderReview",
    },
  });

  await prisma.notification.create({
    data: {
      userId: userId,
      title: "KYC Submission Received",
      message: "Your KYC documents have been submitted for verification",
      category: "kyc",
    },
  });

  return formatUser(updatedUser);
}

/**
 * Get pending KYC applications
 */
export async function getPendingKYC(query: any) {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "vendor",
        kycStatus: {
          in: ["Pending", "UnderReview"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        kycStatus: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: {
        role: "vendor",
        kycStatus: {
          in: ["Pending", "UnderReview"],
        },
      },
    }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all users (with filters)
 */
export async function getAllUsers(query: any) {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const role = query.role;
  const kycStatus = query.kycStatus;

  const whereClause: any = {};
  if (role) whereClause.role = role;
  if (kycStatus) whereClause.kycStatus = kycStatus;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        kycStatus: true,
        companyName: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  await prisma.user.delete({ where: { id: userId } });
}