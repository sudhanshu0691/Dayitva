import { Request } from "express";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        walletAddress?: string;
    };
}
export type UserRole = "officer" | "vendor" | "auditor";
export type KYCStatus = "Pending" | "UnderReview" | "Approved" | "Rejected";
export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: UserRole;
    walletAddress?: string;
    kycStatus: KYCStatus;
    companyName?: string;
    regNumber?: string;
    pan?: string;
    gst?: string;
    turnover?: string;
    itrYears?: string[];
    solvencyCertificate?: string;
    experienceScore?: number;
    designation?: string;
    ministry?: string;
    ministryCode?: string;
    permissions?: string[];
    deviceInfo?: string;
    ipAddress?: string;
    createdAt: string;
}
export type TenderStatus = "Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled";
export interface IPFSFile {
    name: string;
    size: string;
    hash: string;
    uploadedAt: string;
}
export interface ITender {
    id: string;
    title: string;
    description: string;
    ministry: string;
    budget: number;
    deadline: string;
    status: TenderStatus;
    msmeQuota: boolean;
    criteria: string[];
    ipfsHash?: string;
    ipfsFiles: IPFSFile[];
    txHash?: string;
    blockNumber?: number;
    createdAt: string;
    bidsCount: number;
    bids: IBid[];
    winnerAddress?: string;
    winnerPrice?: number;
    winnerName?: string;
    auditTimeline: IAuditStep[];
    isNew?: boolean;
}
export type BidStatus = "Submitted" | "Revealed" | "Evaluated" | "Withdrawn";
export interface IBid {
    id: string;
    tenderId: string;
    vendorName: string;
    vendorAddress: string;
    price?: number;
    isEncrypted: boolean;
    submittedAt: string;
    txHash?: string;
    blockNumber?: number;
    priceScore?: number;
    financialStrength?: number;
    pastExperience?: number;
    performanceFeedback?: number;
    technicalCapability?: number;
    compliance?: number;
    proposalQuality?: number;
    totalScore?: number;
}
export type AuditIconType = "created" | "published" | "bid_submitted" | "evaluation" | "completed";
export interface IAuditStep {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    txHash?: string;
    iconType: AuditIconType;
}
export type TxType = "TENDER_PUBLISHED" | "BID_SUBMITTED" | "BID_REVEALED" | "SMART_CONTRACT_EXECUTED" | "WINNER_DECLARED" | "WALLET_CONNECTED" | "KYC_APPROVED" | "KYC_REJECTED";
export type TxStatus = "success" | "pending" | "failed";
export interface IBlockchainTx {
    id: string;
    txHash: string;
    blockNumber?: number;
    gasFee?: number;
    timestamp: string;
    walletAddress: string;
    type: TxType;
    status: TxStatus;
    metadata: {
        tenderId?: string;
        tenderTitle?: string;
        vendorName?: string;
        bidAmount?: number;
    };
}
export type NotificationCategory = "tender" | "bid" | "kyc" | "system";
export interface INotification {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    read: boolean;
    timestamp: string;
    actionUrl?: string;
}
export type NewsCategory = "Announcement" | "Reform" | "Ministry" | "Blockchain";
export interface ILiveNewsItem {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    category: NewsCategory;
    url: string;
}
export interface IVendorRegistrationData {
    companyName: string;
    regNumber: string;
    contactEmail: string;
    contactPhone: string;
    pan: string;
    gst: string;
    turnover: string;
    itrYears: string[];
    uploads?: IUploadedFile[];
    ipAddress?: string;
    deviceInfo?: string;
    timestamp?: string;
}
export interface IOfficerRegistrationData {
    fullName: string;
    officerEmail: string;
    officerId: string;
    designation: string;
    ministryCode: string;
    permissions: string[];
    uploads?: IUploadedFile[];
    ipAddress?: string;
    deviceInfo?: string;
    timestamp?: string;
}
export interface IUploadedFile {
    name: string;
    size: string;
    uploadedAt: string;
}
export interface IApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}
export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface IBidScoreParams {
    price: number;
    budget: number;
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
}
export interface IBidScoreResult {
    priceScore: number;
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
    totalScore: number;
}
export type DisputeStatus = "Open" | "UnderReview" | "Resolved" | "Dismissed";
export interface IDispute {
    id: string;
    tenderId: string;
    userId: string;
    text: string;
    status: DisputeStatus;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map