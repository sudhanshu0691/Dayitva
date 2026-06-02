import api from "./api";

export interface KYCSubmission {
  documents: string[];
  documentTypes: string[];
}

export interface KYCStatus {
  kycStatus: string;
  kycDocuments: string | null;
  kycRemarks: string | null;
  kycReviewedBy: string | null;
  kycReviewedAt: string | null;
  kycSubmittedAt: string | null;
  kycRequests: KYCRequestRecord[];
}

export interface KYCRequestRecord {
  id: string;
  userId: string;
  userType: string;
  documents: string;
  documentTypes: string;
  status: string;
  remarks: string | null;
  reviewedBy: { fullName: string; officialEmail: string } | null;
  reviewedAt: string | null;
  submissionCount: number;
  createdAt: string;
}

export const kycService = {
  async submitKYC(data: KYCSubmission) {
    const response = await api.post("/kyc/submit", data);
    return response.data;
  },

  async getStatus(): Promise<KYCStatus> {
    const response = await api.get("/kyc/status");
    return response.data;
  },

  async getPending(): Promise<KYCRequestRecord[]> {
    const response = await api.get("/kyc/pending");
    return response.data;
  },

  async getAll(status?: string): Promise<KYCRequestRecord[]> {
    const params = status ? { status } : {};
    const response = await api.get("/kyc/all", { params });
    return response.data;
  },

  async approveKYC(requestId: string, remarks?: string) {
    const response = await api.post(`/kyc/${requestId}/approve`, { remarks });
    return response.data;
  },

  async rejectKYC(requestId: string, remarks: string) {
    const response = await api.post(`/kyc/${requestId}/reject`, { remarks });
    return response.data;
  },
};

export default kycService;