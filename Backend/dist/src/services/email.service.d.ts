/**
 * Generate a random 6-digit OTP
 */
export declare function generateOtp(): string;
/**
 * Send an OTP email for email verification
 */
export declare function sendOtpEmail(email: string, otp: string): Promise<void>;
/**
 * Send a password reset OTP email
 */
export declare function sendPasswordResetOtpEmail(email: string, otp: string): Promise<void>;
//# sourceMappingURL=email.service.d.ts.map