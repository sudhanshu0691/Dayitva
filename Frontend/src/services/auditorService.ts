// ============================================================
// Auditor Service
// Frontend API service for auditor operations
// ============================================================

import api from "./api";

const AUDITOR_BASE = "/auditor";

class AuditorService {
  // ---- AUTH ----

  async login(officialEmail: string, password: string) {
    const res = await api.post(`${AUDITOR_BASE}/login`, { officialEmail, password });
    return res.data.data;
  }

  async register(data: {
    fullName: string;
    officialEmail: string;
    employeeId: string;
    department: string;
    phoneNumber?: string;
    password: string;
  }) {
    const res = await api.post(`${AUDITOR_BASE}/register`, data);
    return res.data.data;
  }

  async logout(refreshToken?: string) {
    await api.post(`${AUDITOR_BASE}/logout`, { refreshToken });
  }

  async getProfile() {
    const res = await api.get(`${AUDITOR_BASE}/profile`);
    return res.data.data;
  }

  async updateProfile(data: { fullName?: string; phoneNumber?: string; profileImage?: string }) {
    const res = await api.put(`${AUDITOR_BASE}/profile`, data);
    return res.data.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await api.post(`${AUDITOR_BASE}/change-password`, { currentPassword, newPassword });
  }

  // ---- VENDOR VERIFICATION ----

  async getVendors(page = 1, limit = 20, search?: string) {
    const params: any = { page, limit };
    if (search) params.search = search;
    const res = await api.get(`${AUDITOR_BASE}/vendors`, { params });
    return res.data.data;
  }

  async getOfficers(page = 1, limit = 20, search?: string) {
    const params: any = { page, limit };
    if (search) params.search = search;
    const res = await api.get(`${AUDITOR_BASE}/officers`, { params });
    return res.data.data;
  }

  // ---- VERIFICATION ACTIONS ----

  async approve(userId: string, remarks: string, userType: "vendor" | "officer") {
    const res = await api.post(`${AUDITOR_BASE}/approve`, { userId, remarks, userType });
    return res.data;
  }

  async reject(userId: string, remarks: string, userType: "vendor" | "officer") {
    const res = await api.post(`${AUDITOR_BASE}/reject`, { userId, remarks, userType });
    return res.data;
  }

  async blacklist(userId: string, reason: string, userType: "vendor" | "officer", isPermanent = false) {
    const res = await api.post(`${AUDITOR_BASE}/blacklist`, { userId, reason, userType, isPermanent });
    return res.data;
  }

  async requestReUpload(userId: string, remarks: string, userType: "vendor" | "officer") {
    const res = await api.post(`${AUDITOR_BASE}/reupload`, { userId, remarks, userType });
    return res.data;
  }

  async flagSuspicious(userId: string, reason: string, userType: "vendor" | "officer") {
    const res = await api.post(`${AUDITOR_BASE}/flag-suspicious`, { userId, reason, userType });
    return res.data;
  }

  async addRemarks(verificationId: string, remarks: string) {
    const res = await api.post(`${AUDITOR_BASE}/remarks`, { verificationId, remarks });
    return res.data;
  }

  // ---- ANALYTICS ----

  async getAnalytics() {
    const res = await api.get(`${AUDITOR_BASE}/analytics`);
    return res.data.data;
  }

  async getFraudMonitoring() {
    const res = await api.get(`${AUDITOR_BASE}/fraud-monitoring`);
    return res.data.data;
  }

  // ---- BLACKLIST ----

  async getBlacklist(page = 1, limit = 20, search?: string) {
    const params: any = { page, limit };
    if (search) params.search = search;
    const res = await api.get(`${AUDITOR_BASE}/blacklist`, { params });
    return res.data.data;
  }

  async removeFromBlacklist(entryId: string) {
    const res = await api.delete(`${AUDITOR_BASE}/blacklist/${entryId}`);
    return res.data;
  }

  // ---- NOTIFICATIONS ----

  async getNotifications(page = 1, limit = 20) {
    const res = await api.get(`${AUDITOR_BASE}/notifications`, { params: { page, limit } });
    return res.data.data;
  }

  async markNotificationRead(notificationId: string) {
    await api.put(`${AUDITOR_BASE}/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    await api.put(`${AUDITOR_BASE}/notifications/read-all`);
  }

  // ---- ACTIVITY LOGS ----

  async getActivityLogs(page = 1, limit = 50, auditorId?: string) {
    const params: any = { page, limit };
    if (auditorId) params.auditorId = auditorId;
    const res = await api.get(`${AUDITOR_BASE}/logs`, { params });
    return res.data.data;
  }

  // ---- VERIFICATION QUEUES ----

  async getVerificationQueues() {
    const res = await api.get(`${AUDITOR_BASE}/queues`);
    return res.data.data;
  }
}

export const auditorService = new AuditorService();
export default auditorService;