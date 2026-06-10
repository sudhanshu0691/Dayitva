import { UpdateProfileInput, KYCVerificationInput } from "../validators/user.validator";
import { IUserProfile } from "../types";
/**
 * Update user profile.
 */
export declare function updateProfile(userId: string, input: UpdateProfileInput): Promise<IUserProfile>;
/**
 * KYC verification - ONLY AUDITOR can do this.
 * @deprecated Use auditorService.approveUser() or auditorService.rejectUser()
 */
export declare function verifyKYC(vendorId: string, input: KYCVerificationInput, officerId: string): Promise<void>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: string): Promise<IUserProfile>;
/**
 * Get KYC status
 */
export declare function getKYCStatus(userId: string): Promise<{
    id: string;
    name: string;
    role: string;
    email: string;
    pan: string | null;
    gst: string | null;
    kycStatus: import(".prisma/client").$Enums.KYCStatus;
    solvencyCertificate: string | null;
} | {
    id: string;
    ministry: string | null;
    name: string;
    role: string;
    email: string;
    designation: string | null;
    kycStatus: import(".prisma/client").$Enums.KYCStatus;
}>;
/**
 * Submit KYC documents (supports both vendors and officers)
 */
export declare function submitKYC(userId: string, kycData: any): Promise<IUserProfile>;
/**
 * Get pending KYC applications
 */
export declare function getPendingKYC(query: any): Promise<{
    data: {
        vendors: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            companyName: string | null;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
        }[];
        officers: {
            id: string;
            ministry: string | null;
            createdAt: Date;
            name: string;
            email: string;
            designation: string | null;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
        }[];
    };
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
    data: any[];
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