"use strict";
// ============================================================
// Authentication Service
// Handles registration, login, MetaMask nonce/signature, JWT
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginWithCredentials = loginWithCredentials;
exports.generateNonce = generateNonce;
exports.loginWithMetaMask = loginWithMetaMask;
exports.refreshAccessToken = refreshAccessToken;
exports.logoutUser = logoutUser;
exports.getCurrentUser = getCurrentUser;
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.resendOtp = resendOtp;
const bcrypt_1 = __importDefault(require("bcrypt"));
const ethers_1 = require("ethers");
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const email_service_1 = require("./email.service");
const SALT_ROUNDS = 12;
const NONCE_EXPIRY_MINUTES = 5;
/**
 * Format a Prisma User object into the API response shape.
 */
function formatUserProfile(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || undefined,
        role: user.role,
        walletAddress: user.walletAddress || undefined,
        kycStatus: user.kycStatus,
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
async function registerUser(input) {
    // Check if email already exists
    const existingEmail = await database_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existingEmail) {
        throw new errorHandler_1.AppError("Email already registered", 409);
    }
    // Check if wallet address already exists (if provided)
    if (input.walletAddress) {
        const existingWallet = await database_1.prisma.user.findUnique({
            where: { walletAddress: input.walletAddress },
        });
        if (existingWallet) {
            throw new errorHandler_1.AppError("Wallet address already registered", 409);
        }
    }
    // Hash password
    const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
    // Create user
    const user = await database_1.prisma.user.create({
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
        await database_1.prisma.vendorProfile.create({
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
async function loginWithCredentials(input) {
    // Find user by email
    const user = await database_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (!user || !user.passwordHash) {
        throw new errorHandler_1.AppError("Invalid email or password", 401);
    }
    // Verify password
    const isValid = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!isValid) {
        throw new errorHandler_1.AppError("Invalid email or password", 401);
    }
    // Check if email is verified
    if (!user.emailVerified) {
        throw new errorHandler_1.AppError("Email not verified. Please verify your email before logging in.", 403);
    }
    // Generate tokens
    const tokenPayload = {
        userId: user.id,
        role: user.role,
        walletAddress: user.walletAddress || undefined,
    };
    const tokens = (0, jwt_1.generateTokenPair)(tokenPayload);
    // Store refresh token
    await database_1.prisma.refreshToken.create({
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
async function generateNonce(walletAddress) {
    const nonce = (0, uuid_1.v4)();
    await database_1.prisma.nonce.create({
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
async function loginWithMetaMask(walletAddress, signature) {
    const address = walletAddress.toLowerCase();
    // Find the latest unused nonce for this wallet
    const nonceRecord = await database_1.prisma.nonce.findFirst({
        where: {
            walletAddress: address,
            used: false,
            expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!nonceRecord) {
        throw new errorHandler_1.AppError("No valid nonce found. Please request a new nonce.", 401);
    }
    // Verify the signature
    const message = `Welcome to Decentralized TenderChain!\n\nSign this message to authenticate your wallet.\n\nNonce: ${nonceRecord.nonce}\n\nThis signature will not trigger any blockchain transaction or gas fee.`;
    let recoveredAddress;
    try {
        recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
    }
    catch (error) {
        throw new errorHandler_1.AppError("Invalid signature format", 401);
    }
    if (recoveredAddress.toLowerCase() !== address) {
        throw new errorHandler_1.AppError("Signature verification failed. The signature does not match the wallet address.", 401);
    }
    // Mark nonce as used
    await database_1.prisma.nonce.update({
        where: { id: nonceRecord.id },
        data: { used: true },
    });
    // Find or create user by wallet address
    let user = await database_1.prisma.user.findUnique({
        where: { walletAddress: address },
    });
    if (!user) {
        throw new errorHandler_1.AppError("No user registered with this wallet address. Please register first.", 404);
    }
    // Generate tokens
    const tokenPayload = {
        userId: user.id,
        role: user.role,
        walletAddress: address,
    };
    const tokens = (0, jwt_1.generateTokenPair)(tokenPayload);
    // Store refresh token
    await database_1.prisma.refreshToken.create({
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
async function refreshAccessToken(refreshToken) {
    // Verify the refresh token signature
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch (error) {
        throw new errorHandler_1.AppError("Invalid or expired refresh token", 401);
    }
    // Check if token exists in database
    const storedToken = await database_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    });
    if (!storedToken) {
        throw new errorHandler_1.AppError("Refresh token has been revoked", 401);
    }
    // Check expiry
    if (storedToken.expiresAt < new Date()) {
        await database_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new errorHandler_1.AppError("Refresh token has expired", 401);
    }
    // Get user
    const user = await database_1.prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        throw new errorHandler_1.AppError("User not found", 404);
    }
    // Generate new tokens
    const tokenPayload = {
        userId: user.id,
        role: user.role,
        walletAddress: user.walletAddress || undefined,
    };
    const tokens = (0, jwt_1.generateTokenPair)(tokenPayload);
    // Delete old refresh token
    await database_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
    // Store new refresh token
    await database_1.prisma.refreshToken.create({
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
async function logoutUser(userId) {
    await database_1.prisma.refreshToken.deleteMany({
        where: { userId },
    });
}
/**
 * Get current user profile.
 */
async function getCurrentUser(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errorHandler_1.AppError("User not found", 404);
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
async function sendOtp(input) {
    const { email, type } = input;
    // Check if email exists for forgot password
    if (type === "FORGOT_PASSWORD") {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new errorHandler_1.AppError("No account found with this email address", 404);
        }
    }
    // Mark any existing unused OTPs as used
    await database_1.prisma.otp.updateMany({
        where: { email, type, used: false },
        data: { used: true },
    });
    // Generate and store new OTP
    const otp = (0, email_service_1.generateOtp)();
    await database_1.prisma.otp.create({
        data: {
            email,
            otp,
            type,
            expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        },
    });
    // Send OTP via email
    if (type === "FORGOT_PASSWORD") {
        await (0, email_service_1.sendPasswordResetOtpEmail)(email, otp);
    }
    else {
        await (0, email_service_1.sendOtpEmail)(email, otp);
    }
    // In development, return the OTP for convenience
    const response = {
        message: `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
        expiresIn: OTP_EXPIRY_MINUTES * 60,
    };
    if (env_1.env.NODE_ENV === "development") {
        response.devOtp = otp;
    }
    return response;
}
/**
 * Verify an OTP for email verification or password reset.
 */
async function verifyOtp(input) {
    const { email, otp, type } = input;
    // Find a valid, unused OTP
    const otpRecord = await database_1.prisma.otp.findFirst({
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
        throw new errorHandler_1.AppError("Invalid or expired OTP", 400);
    }
    // Mark OTP as used
    await database_1.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
    });
    // If this is for email verification, update the user
    if (type === "VERIFY_EMAIL") {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new errorHandler_1.AppError("User not found with this email", 404);
        }
        // Check if user is already verified
        if (user.emailVerified) {
            return { message: "Email already verified", emailVerified: true };
        }
        // Mark email as verified
        await database_1.prisma.user.update({
            where: { email },
            data: { emailVerified: true },
        });
    }
    return { message: "OTP verified successfully", verified: true };
}
/**
 * Forgot password - sends OTP to email.
 */
async function forgotPassword(email) {
    return sendOtp({ email, type: "FORGOT_PASSWORD" });
}
/**
 * Reset password using OTP verification.
 */
async function resetPassword(input) {
    const { email, otp, newPassword } = input;
    // Verify OTP first
    await verifyOtp({ email, otp, type: "FORGOT_PASSWORD" });
    // Hash new password
    const passwordHash = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
    // Update user password
    await database_1.prisma.user.update({
        where: { email },
        data: { passwordHash },
    });
    // Revoke all refresh tokens for this user (force re-login)
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (user) {
        await database_1.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });
    }
    return { message: "Password reset successfully. Please login with your new password." };
}
/**
 * Resend OTP (same as sendOtp but with a cooldown check).
 */
async function resendOtp(input) {
    const { email, type } = input;
    // Check if there's a recent OTP that hasn't expired (cooldown)
    const recentOtp = await database_1.prisma.otp.findFirst({
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
            throw new errorHandler_1.AppError("Please wait 30 seconds before requesting a new OTP", 429);
        }
    }
    return sendOtp(input);
}
//# sourceMappingURL=auth.service.js.map