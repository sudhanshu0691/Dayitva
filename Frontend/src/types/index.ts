export type UserRole = "officer" | "vendor" | "public";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Vendor specific
  companyName?: string;
  regNumber?: string;
  pan?: string;
  gst?: string;
  kycStatus?: "Pending" | "Under Review" | "Approved" | "Rejected";
  turnover?: string;
  itrYears?: string[];
  solvencyCertificate?: string;
  deviceInfo?: string;
  ipAddress?: string;
  timestamp?: string;
  // Officer specific
  designation?: string;
  ministry?: string;
  ministryCode?: string;
  permissions?: string[];
}

export interface IPFSFile {
  name: string;
  size: string;
  hash: string;
  uploadedAt: string;
}

export interface Bid {
  id: string;
  tenderId: string;
  vendorName: string;
  vendorAddress: string;
  price: number;
  isEncrypted: boolean;
  submittedAt: string;
  txHash: string;
  blockNumber: number;
}

export interface AuditStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  txHash?: string;
  iconType: "created" | "published" | "bid_submitted" | "evaluation" | "completed";
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  ministry: string;
  budget: number;
  deadline: string;
  status: "Open" | "Closed" | "Under Evaluation" | "Awarded";
  msmeQuota: boolean;
  criteria: string[];
  ipfsHash: string;
  ipfsFiles: IPFSFile[];
  txHash: string;
  blockNumber: number;
  createdAt: string;
  bidsCount: number;
  bids: Bid[];
  winnerAddress?: string;
  winnerPrice?: number;
  winnerName?: string;
  auditTimeline: AuditStep[];
  isNew?: boolean;
}

export type TxType = "TENDER_PUBLISHED" | "BID_SUBMITTED" | "SMART_CONTRACT_EXECUTED" | "WINNER_DECLARED" | "WALLET_CONNECTED" | "KYC_APPROVED";

export interface BlockchainTx {
  txHash: string;
  blockNumber: number;
  gasFee: number;
  timestamp: string;
  walletAddress: string;
  type: TxType;
  status: "success" | "pending" | "failed";
  metadata: {
    tenderId?: string;
    tenderTitle?: string;
    bidAmount?: number;
    vendorName?: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: "tender" | "bid" | "kyc" | "system";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface LiveNewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  category: "Announcement" | "Reform" | "Ministry" | "Blockchain";
  url: string;
}

// Vendor registration data
export interface VendorRegistrationData {
  companyName: string;
  regNumber: string;
  contactEmail: string;
  contactPhone: string;
  pan: string;
  gst: string;
  turnover: string;
  itrYears: string[];
  uploads?: UploadedFile[];
  ipAddress?: string;
  deviceInfo?: string;
  timestamp?: string;
}

// Officer registration data
export interface OfficerRegistrationData {
  fullName: string;
  officerEmail: string;
  officerId: string;
  designation: string;
  ministryCode: string;
  permissions: string[];
  uploads?: UploadedFile[];
  ipAddress?: string;
  deviceInfo?: string;
  timestamp?: string;
}

// Uploaded file metadata
export interface UploadedFile {
  name: string;
  size: string;
  uploadedAt: string;
}

// Transaction metadata
export interface TxMetadata {
  tenderId?: string;
  tenderTitle?: string;
  vendorName?: string;
  bidAmount?: number;
}

// Toast notification (for in-app toast system)
export interface Toast {
  id: string;
  title: string;
  message: string;
  category: Notification["category"];
}

// Form field error
export interface FormFieldError {
  field: string;
  message: string;
}

// Persisted portal state for localStorage
export interface PersistedPortalState {
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: string;
  userRole: UserRole;
  currentUser: UserProfile | null;
  notifications: Notification[];
  language: "en" | "hi";
  theme: "light" | "dark";
  fontSize: "sm" | "base" | "lg";
  fontScalePercent?: number;
  recentSearches: string[];
}

// Verification result
export interface VerificationResult {
  blockNumber: number;
  consensusStatus: string;
  merkleRoot: string;
  gasUsed: string;
  timestamp: string;
}