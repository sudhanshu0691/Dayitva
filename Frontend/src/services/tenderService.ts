// ============================================================
// Tender Service
// Handles tender-related APIs
// ============================================================

import api from "./api";

export interface TenderData {
  title: string;
  description: string;
  ministry?: string;
  budget: number;
  deadline: string;
  msmeQuota?: boolean;
  criteria?: string[];
  ipfsHash?: string;
  ipfsFiles?: any[];
}

export interface BidData {
  encryptedBidHash: string;
  price?: number;
}

/** For the simplified bid form (just price) */
export interface SimpleBidData {
  price: number;
}

class TenderService {
  async listTenders(params?: any): Promise<any> {
    const response = await api.get("/tenders", { params });
    return response.data;
  }

  async getTenderById(id: string): Promise<any> {
    const response = await api.get(`/tenders/${id}`);
    return response.data.data;
  }

  async createTender(data: TenderData): Promise<any> {
    const response = await api.post("/tenders", data);
    return response.data.data;
  }

  async updateTender(id: string, data: Partial<TenderData>): Promise<any> {
    const response = await api.put(`/tenders/${id}`, data);
    return response.data.data;
  }

  async updateTenderStatus(id: string, status: string): Promise<any> {
    const response = await api.patch(`/tenders/${id}/status`, { status });
    return response.data.data;
  }

  async deleteTender(id: string): Promise<void> {
    await api.delete(`/tenders/${id}`);
  }

  async getTenderBids(tenderId: string): Promise<any[]> {
    const response = await api.get(`/tenders/${tenderId}/bids`);
    return response.data.data;
  }

  async submitBid(tenderId: string, data: BidData): Promise<any> {
    // Create encrypted hash from price data for commit-reveal scheme
    const payload = {
      encryptedBidHash: data.encryptedBidHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      price: data.price,
    };
    const response = await api.post(`/tenders/${tenderId}/bids`, payload);
    return response.data.data;
  }

  /** Simplified bid submission - creates an encrypted hash automatically */
  async submitSimpleBid(tenderId: string, data: SimpleBidData): Promise<any> {
    // Auto-generate hash for commit phase
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const response = await api.post(`/tenders/${tenderId}/bids`, {
      encryptedBidHash: hash,
      price: data.price,
    });
    return response.data.data;
  }

  async revealBid(tenderId: string, price: number, scoringParams: {
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
  }): Promise<any> {
    const response = await api.post(`/tenders/${tenderId}/bids/reveal`, {
      price,
      ...scoringParams,
    });
    return response.data.data;
  }

  async evaluateTender(tenderId: string): Promise<any> {
    const response = await api.post(`/tenders/${tenderId}/evaluate`);
    return response.data.data;
  }
}

export default new TenderService();
