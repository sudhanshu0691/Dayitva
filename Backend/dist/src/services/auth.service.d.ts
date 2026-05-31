import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, ResetPasswordInput } from "../validators/auth.validator";
import { IUserProfile } from "../types";
/**
 * Register a new user (officer or vendor).
 */
export declare function registerUser(input: RegisterInput): Promise<{
    user: IUserProfile;
    message: string;
}>;
/**
 * Login with email and password.
 */
export declare function loginWithCredentials(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserProfile;
}>;
/**
 * Generate a nonce for MetaMask wallet signature verification.
 * Nonce is a random string that expires after 5 minutes.
 */
export declare function generateNonce(walletAddress: string): Promise<{
    nonce: string;
    message: string;
    expiresAt: string;
}>;
/**
 * Login with MetaMask wallet signature.
 * Verifies that the user signed the nonce with their private key.
 */
export declare function loginWithMetaMask(walletAddress: string, signature: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserProfile;
}>;
/**
 * Refresh an expired access token using a valid refresh token.
 */
export declare function refreshAccessToken(refreshToken: string): Promise<import("../utils/jwt").TokenPair>;
/**
 * Logout by revoking all refresh tokens for a user.
 */
export declare function logoutUser(userId: string): Promise<void>;
/**
 * Get current user profile.
 */
export declare function getCurrentUser(userId: string): Promise<IUserProfile>;
/**
 * Send an OTP to the user's email for verification or password reset.
 */
export declare function sendOtp(input: SendOtpInput): Promise<any>;
/**
 * Verify an OTP for email verification or password reset.
 */
export declare function verifyOtp(input: VerifyOtpInput): Promise<{
    message: string;
    emailVerified: boolean;
    verified?: undefined;
} | {
    message: string;
    verified: boolean;
    emailVerified?: undefined;
}>;
/**
 * Forgot password - sends OTP to email.
 */
export declare function forgotPassword(email: string): Promise<any>;
/**
 * Reset password using OTP verification.
 */
export declare function resetPassword(input: ResetPasswordInput): Promise<{
    message: string;
}>;
/**
 * Resend OTP (same as sendOtp but with a cooldown check).
 */
export declare function resendOtp(input: SendOtpInput): Promise<any>;
//# sourceMappingURL=auth.service.d.ts.map