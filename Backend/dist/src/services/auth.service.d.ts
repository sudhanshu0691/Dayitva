import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { IUserProfile } from "../types";
/**
 * Register a new user (officer or vendor).
 */
export declare function registerUser(input: RegisterInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserProfile;
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
//# sourceMappingURL=auth.service.d.ts.map