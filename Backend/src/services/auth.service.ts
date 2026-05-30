// ============================================================
// Authentication Service
// Handles registration, login, MetaMask nonce/signature, JWT
// ============================================================

import bcrypt from "bcrypt";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database";
import { env } from "../config/env";
import {
  generateTokenPair,
  generateAccessToken,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { IUserProfile } from "../types";

const SALT_ROUNDS = 12;
const NONCE_EXPIRY_MINUTES = 5;

/**
 * Format a Prisma User object into the API response shape.
 */
function formatUserProfile(user: any): IUserProfile {
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
 * Register a new user (officer or vendor).
 */
export async function registerUser(input: RegisterInput) {
  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new AppError("Email already registered", 409);
  }

  // Check if wallet address already exists (if provided)
  if (input.walletAddress) {
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress: input.walletAddress },
    });
    if (existingWallet) {
      throw new AppError("Wallet address already registered", 409);
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      mobile: input.mobile || null,
      passwordHash,
      role: input.role,
      walletAddress: input.walletAddress || null,
      // Vendor-specific fields
      companyName: input.companyName || null,
      regNumber: input.regNumber || null,
      pan: input.pan || null,
      gst: input.gst || null,
      turnover: input.turnover || null,
      itrYears: input.itrYears ? JSON.stringify(input.itrYears) : null,
      // Officer-specific fields
      designation: input.designation || null,
      ministry: input.ministry || null,
      ministryCode: input.ministryCode || null,
      permissions: input.permissions ? JSON.stringify(input.permissions) : null,
      // KYC status defaults to Pending for vendors
      kycStatus: input.role === "vendor" ? "Pending" : "Approved",
    },
  });

  // Create vendor profile if vendor
  if (input.role === "vendor") {
    await prisma.vendorProfile.create({
      data: {
        vendorId: user.id,
      },
    });
  }

  // Generate JWT tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    walletAddress: user.walletAddress || undefined,
  };
  const tokens = generateTokenPair(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: formatUserProfile(user),
    ...tokens,
  };
}

/**
 * Login with email and password.
 */
export async function loginWithCredentials(input: LoginInput) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  // Verify password
  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    walletAddress: user.walletAddress || undefined,
  };
  const tokens = generateTokenPair(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: formatUserProfile(user),
    ...tokens,
  };
}

/**
 * Generate a nonce for MetaMask wallet signature verification.
 * Nonce is a random string that expires after 5 minutes.
 */
export async function generateNonce(walletAddress: string) {
  const nonce = uuidv4();

  await prisma.nonce.create({
    data: {
      walletAddress: walletAddress.toLowerCase(),
      nonce,
      expiresAt: new Date(Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  return {
    nonce,
    message: `Welcome to Decentralized TenderChain!\n\nSign this message to authenticate your wallet.\n\nNonce: ${nonce}\n\nThis signature will not trigger any blockchain transaction or gas fee.`,
    expiresAt: new Date(Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000).toISOString(),
  };
}

/**
 * Login with MetaMask wallet signature.
 * Verifies that the user signed the nonce with their private key.
 */
export async function loginWithMetaMask(walletAddress: string, signature: string) {
  const address = walletAddress.toLowerCase();

  // Find the latest unused nonce for this wallet
  const nonceRecord = await prisma.nonce.findFirst({
    where: {
      walletAddress: address,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!nonceRecord) {
    throw new AppError(
      "No valid nonce found. Please request a new nonce.",
      401
    );
  }

  // Verify the signature
  const message = `Welcome to Decentralized TenderChain!\n\nSign this message to authenticate your wallet.\n\nNonce: ${nonceRecord.nonce}\n\nThis signature will not trigger any blockchain transaction or gas fee.`;

  let recoveredAddress: string;
  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch (error) {
    throw new AppError("Invalid signature format", 401);
  }

  if (recoveredAddress.toLowerCase() !== address) {
    throw new AppError(
      "Signature verification failed. The signature does not match the wallet address.",
      401
    );
  }

  // Mark nonce as used
  await prisma.nonce.update({
    where: { id: nonceRecord.id },
    data: { used: true },
  });

  // Find or create user by wallet address
  let user = await prisma.user.findUnique({
    where: { walletAddress: address },
  });

  if (!user) {
    throw new AppError(
      "No user registered with this wallet address. Please register first.",
      404
    );
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    walletAddress: address,
  };
  const tokens = generateTokenPair(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: formatUserProfile(user),
    ...tokens,
  };
}

/**
 * Refresh an expired access token using a valid refresh token.
 */
export async function refreshAccessToken(refreshToken: string) {
  // Verify the refresh token signature
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Check if token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  // Check expiry
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError("Refresh token has expired", 401);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Generate new tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    walletAddress: user.walletAddress || undefined,
  };

  const tokens = generateTokenPair(tokenPayload);

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

/**
 * Logout by revoking all refresh tokens for a user.
 */
export async function logoutUser(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

/**
 * Get current user profile.
 */
export async function getCurrentUser(userId: string): Promise<IUserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return formatUserProfile(user);
}