// ============================================================
// Dispute Service
// Handles dispute-related APIs
// ============================================================

import api from "./api";

export interface DisputeData {
  tenderId: string;
  text: string;
  category?: string;
}

class DisputeService {
  async createDispute(data: DisputeData): Promise<any> {
    const response = await api.post("/disputes", data);
    return response.data.data;
  }

  async getDisputeById(id: string): Promise<any> {
    const response = await api.get(`/disputes/${id}`);
    return response.data.data;
  }

  async getDisputesByTender(tenderId: string): Promise<any[]> {
    const response = await api.get(`/disputes/tender/${tenderId}`);
    return response.data.data;
  }

  async updateDisputeStatus(id: string, status: string, resolution?: string): Promise<any> {
    const response = await api.put(`/disputes/${id}/status`, {
      status,
      resolution,
    });
    return response.data.data;
  }

  async listDisputes(params?: any): Promise<any> {
    const response = await api.get("/disputes", { params });
    return response.data;
  }
}

export default new DisputeService();
