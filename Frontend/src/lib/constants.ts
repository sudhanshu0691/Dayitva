// ============================================================
// Environment Configuration
// Frontend environment variables and constants
// ============================================================

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  socketURL: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
  timeout: 10000,
};

// App Configuration
export const APP_CONFIG = {
  name: "Decentralized TenderChain",
  version: "1.0.0",
  environment: process.env.NEXT_PUBLIC_ENV || "development",
  debug: process.env.NEXT_PUBLIC_DEBUG === "true",
};

// Role Configuration
export const ROLES = {
  OFFICER: "officer",
  VENDOR: "vendor",
};

// Tender Status
export const TENDER_STATUS = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
  UNDER_EVALUATION: "UnderEvaluation",
  AWARDED: "Awarded",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

// KYC Status
export const KYC_STATUS = {
  PENDING: "Pending",
  UNDER_REVIEW: "UnderReview",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Notification Category
export const NOTIFICATION_CATEGORIES = {
  TENDER: "tender",
  BID: "bid",
  KYC: "kyc",
  SYSTEM: "system",
};

// Routes
export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",
  REGISTER: "/register",
  TENDERS: "/tenders",
  TENDER_DETAIL: "/tenders/:id",

  // Officer
  OFFICER_DASHBOARD: "/admin",
  CREATE_TENDER: "/admin/create-tender",
  OFFICER_PROFILE: "/admin/profile",
  TENDER_MANAGEMENT: "/admin/tenders",
  KYC_VERIFICATION: "/admin/kyc",

  // Vendor
  VENDOR_DASHBOARD: "/vendor",
  VENDOR_PROFILE: "/vendor/profile",
  MY_BIDS: "/vendor/bids",
  MY_TENDERS: "/vendor/tenders",

  // Common
  NOTIFICATIONS: "/notifications",
  DISPUTES: "/disputes",
  SETTINGS: "/settings",
  PROFILE: "/profile",

  // Error
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

// File Upload
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
  ],
};