import { UpdateProfileInput, KYCVerificationInput } from "../validators/user.validator";
import { IUserProfile } from "../types";
/**
 * Update user profile.
 */
export declare function updateProfile(userId: string, input: UpdateProfileInput): Promise<IUserProfile>;
/**
 * KYC verification (Officer only).
 */
export declare function verifyKYC(vendorId: string, input: KYCVerificationInput, officerId: string): Promise<IUserProfile>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: string): Promise<IUserProfile>;
/**
 * Get KYC status
 */
export declare function getKYCStatus(userId: string): Promise<{
    role: import(".prisma/client").$Enums.UserRole;
    name: string;
    email: string;
    pan: string | null;
    gst: string | null;
    kycStatus: import(".prisma/client").$Enums.KYCStatus;
    id: string;
    solvencyCertificate: string | null;
}>;
/**
 * Submit KYC documents
 */
export declare function submitKYC(userId: string, kycData: any): Promise<IUserProfile>;
/**
 * Get pending KYC applications
 */
export declare function getPendingKYC(query: any): Promise<{
    data: {
        name: string;
        email: string;
        companyName: string | null;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
        id: string;
        createdAt: Date;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get all users (with filters)
 */
export declare function getAllUsers(query: any): Promise<{
    data: {
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        email: string;
        mobile: string | null;
        companyName: string | null;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
        id: string;
        createdAt: Date;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Delete user (Admin only)
 */
export declare function deleteUser(userId: string): Promise<void>;
//# sourceMappingURL=user.service.d.ts.map