export interface TokenPayload {
    userId: string;
    role: string;
    walletAddress?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
/**
 * Generate an access token (short-lived, typically 15 minutes).
 * @param payload - User identifier and role
 * @returns Signed JWT access token
 */
export declare function generateAccessToken(payload: TokenPayload): string;
/**
 * Generate a refresh token (long-lived, typically 7 days).
 * @param payload - User identifier
 * @returns Signed JWT refresh token
 */
export declare function generateRefreshToken(payload: Pick<TokenPayload, "userId">): string;
/**
 * Generate an access + refresh token pair.
 */
export declare function generateTokenPair(payload: TokenPayload): TokenPair;
/**
 * Verify and decode an access token.
 * @returns Decoded payload or throws
 */
export declare function verifyAccessToken(token: string): TokenPayload;
/**
 * Verify and decode a refresh token.
 * @returns Decoded payload with userId
 */
export declare function verifyRefreshToken(token: string): Pick<TokenPayload, "userId">;
//# sourceMappingURL=jwt.d.ts.map