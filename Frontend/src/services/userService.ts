// ============================================================
// User Service
// Handles user profile and KYC APIs
// ============================================================

import api from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
  companyName?: string;
}

export interface KYCData {
  pan?: string;
  gst?: string;
  solvencyCertificate?: string;
  regNumber?: string;
  companyName?: string;
}

class UserService {
  async getUserById(id: string): Promise<UserProfile> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put("/users/profile", data);
    return response.data.data;
  }

  async getKYCStatus(): Promise<any> {
    const response = await api.get("/users/kyc/status");
    return response.data.data;
  }

  async submitKYC(data: KYCData): Promise<UserProfile> {
    const response = await api.post("/users/kyc/submit", data);
    return response.data.data;
  }

  async getPendingKYC(params?: any): Promise<any> {
    const response = await api.get("/users/kyc/pending", { params });
    return response.data;
  }

  async verifyKYC(vendorId: string, status: string, remarks?: string): Promise<UserProfile> {
    const response = await api.put(`/users/kyc/${vendorId}/verify`, {
      status,
      remarks,
    });
    return response.data.data;
  }

  async getAllUsers(params?: any): Promise<any> {
    const response = await api.get("/users", { params });
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

export default new UserService();
