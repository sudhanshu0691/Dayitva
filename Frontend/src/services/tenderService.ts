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
  vendorName: string;
  vendorAddress: string;
  price: number;
  encryptedPayload?: string;
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
    const response = await api.post(`/tenders/${tenderId}/bids`, data);
    return response.data.data;
  }

  async revealBid(tenderId: string, bidId: string, price: number): Promise<any> {
    const response = await api.post(`/tenders/${tenderId}/bids/reveal`, {
      bidId,
      price,
    });
    return response.data.data;
  }

  async evaluateTender(tenderId: string): Promise<any> {
    const response = await api.post(`/tenders/${tenderId}/evaluate`);
    return response.data.data;
  }
}

export default new TenderService();
