import { z } from "zod";
/**
 * Registration schema for vendors and officers.
 */
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    mobile: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodEnum<["officer", "vendor"]>;
    walletAddress: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    regNumber: z.ZodOptional<z.ZodString>;
    pan: z.ZodOptional<z.ZodString>;
    gst: z.ZodOptional<z.ZodString>;
    turnover: z.ZodOptional<z.ZodString>;
    itrYears: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    designation: z.ZodOptional<z.ZodString>;
    ministry: z.ZodOptional<z.ZodString>;
    ministryCode: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    role: "vendor" | "officer";
    email: string;
    password: string;
    ministry?: string | undefined;
    walletAddress?: string | undefined;
    mobile?: string | undefined;
    companyName?: string | undefined;
    regNumber?: string | undefined;
    pan?: string | undefined;
    gst?: string | undefined;
    turnover?: string | undefined;
    itrYears?: string[] | undefined;
    designation?: string | undefined;
    ministryCode?: string | undefined;
    permissions?: string[] | undefined;
}, {
    name: string;
    role: "vendor" | "officer";
    email: string;
    password: string;
    ministry?: string | undefined;
    walletAddress?: string | undefined;
    mobile?: string | undefined;
    companyName?: string | undefined;
    regNumber?: string | undefined;
    pan?: string | undefined;
    gst?: string | undefined;
    turnover?: string | undefined;
    itrYears?: string[] | undefined;
    designation?: string | undefined;
    ministryCode?: string | undefined;
    permissions?: string[] | undefined;
}>;
/**
 * Login with email and password.
 */
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
/**
 * Request a nonce for MetaMask signature verification.
 */
export declare const nonceRequestSchema: z.ZodObject<{
    walletAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
}, {
    walletAddress: string;
}>;
/**
 * Login with MetaMask signature.
 */
export declare const metamaskLoginSchema: z.ZodObject<{
    walletAddress: z.ZodString;
    signature: z.ZodString;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
    signature: string;
}, {
    walletAddress: string;
    signature: string;
}>;
/**
 * Refresh token schema.
 */
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
/**
 * Send OTP schema.
 */
export declare const sendOtpSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["VERIFY_EMAIL", "FORGOT_PASSWORD"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "VERIFY_EMAIL" | "FORGOT_PASSWORD";
}, {
    email: string;
    type?: "VERIFY_EMAIL" | "FORGOT_PASSWORD" | undefined;
}>;
/**
 * Verify OTP schema.
 */
export declare const verifyOtpSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["VERIFY_EMAIL", "FORGOT_PASSWORD"]>>;
}, "strip", z.ZodTypeAny, {
    otp: string;
    email: string;
    type: "VERIFY_EMAIL" | "FORGOT_PASSWORD";
}, {
    otp: string;
    email: string;
    type?: "VERIFY_EMAIL" | "FORGOT_PASSWORD" | undefined;
}>;
/**
 * Forgot password schema.
 */
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
/**
 * Reset password schema.
 */
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otp: string;
    email: string;
    newPassword: string;
}, {
    otp: string;
    email: string;
    newPassword: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NonceRequestInput = z.infer<typeof nonceRequestSchema>;
export type MetaMaskLoginInput = z.infer<typeof metamaskLoginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
//# sourceMappingURL=auth.validator.d.ts.map