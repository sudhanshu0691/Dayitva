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
import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, ResetPasswordInput } from "../validators/auth.validator";
import { IUserProfile } from "../types";
import { generateOtp, sendOtpEmail, sendPasswordResetOtpEmail } from "./email.service";

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

  // Do NOT generate tokens or auto-login - user must verify email first
  // Registration only creates the user account
  return {
    user: formatUserProfile(user),
    message: "Registration successful. Please verify your email and then login.",
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

  // Check if email is verified
  if (!user.emailVerified) {
    throw new AppError("Email not verified. Please verify your email before logging in.", 403);
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

// ============================================================
// OTP & Email Verification Functions
// ============================================================

const OTP_EXPIRY_MINUTES = 10;

/**
 * Send an OTP to the user's email for verification or password reset.
 */
export async function sendOtp(input: SendOtpInput) {
  const { email, type } = input;

  // Check if email exists for forgot password
  if (type === "FORGOT_PASSWORD") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("No account found with this email address", 404);
    }
  }

  // Mark any existing unused OTPs as used
  await prisma.otp.updateMany({
    where: { email, type, used: false },
    data: { used: true },
  });

  // Generate and store new OTP
  const otp = generateOtp();
  await prisma.otp.create({
    data: {
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  // Send OTP via email
  if (type === "FORGOT_PASSWORD") {
    await sendPasswordResetOtpEmail(email, otp);
  } else {
    await sendOtpEmail(email, otp);
  }

  // In development, return the OTP for convenience
  const response: any = {
    message: `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  };

  if (env.NODE_ENV === "development") {
    response.devOtp = otp;
  }

  return response;
}

/**
 * Verify an OTP for email verification or password reset.
 */
export async function verifyOtp(input: VerifyOtpInput) {
  const { email, otp, type } = input;

  // Find a valid, unused OTP
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      type,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  // Mark OTP as used
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // If this is for email verification, update the user
  if (type === "VERIFY_EMAIL") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("User not found with this email", 404);
    }
    // Check if user is already verified
    if (user.emailVerified) {
      return { message: "Email already verified", emailVerified: true };
    }
    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }

  return { message: "OTP verified successfully", verified: true };
}

/**
 * Forgot password - sends OTP to email.
 */
export async function forgotPassword(email: string) {
  return sendOtp({ email, type: "FORGOT_PASSWORD" });
}

/**
 * Reset password using OTP verification.
 */
export async function resetPassword(input: ResetPasswordInput) {
  const { email, otp, newPassword } = input;

  // Verify OTP first
  await verifyOtp({ email, otp, type: "FORGOT_PASSWORD" });

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user password
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  // Revoke all refresh tokens for this user (force re-login)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  }

  return { message: "Password reset successfully. Please login with your new password." };
}

/**
 * Resend OTP (same as sendOtp but with a cooldown check).
 */
export async function resendOtp(input: SendOtpInput) {
  const { email, type } = input;

  // Check if there's a recent OTP that hasn't expired (cooldown)
  const recentOtp = await prisma.otp.findFirst({
    where: {
      email,
      type,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    // If OTP was sent less than 30 seconds ago, reject
    const timeSinceLastOtp = Date.now() - recentOtp.createdAt.getTime();
    if (timeSinceLastOtp < 30000) {
      throw new AppError("Please wait 30 seconds before requesting a new OTP", 429);
    }
  }

  return sendOtp(input);
}
