// ============================================================
// Dashboard Service
// Handles dashboard and report APIs
// ============================================================

import api from "./api";

class DashboardService {
  async getOfficerDashboard(): Promise<any> {
    const response = await api.get("/dashboard/officer");
    return response.data.data;
  }

  async getVendorDashboard(): Promise<any> {
    const response = await api.get("/dashboard/vendor");
    return response.data.data;
  }

  async getAnalytics(): Promise<any> {
    const response = await api.get("/dashboard/analytics");
    return response.data.data;
  }

  async getTenderReports(params?: any): Promise<any> {
    const response = await api.get("/reports/tenders", { params });
    return response.data;
  }

  async getBidReports(params?: any): Promise<any> {
    const response = await api.get("/reports/bids", { params });
    return response.data;
  }

  async getKYCReports(params?: any): Promise<any> {
    const response = await api.get("/reports/kyc", { params });
    return response.data;
  }
}

export default new DashboardService();
