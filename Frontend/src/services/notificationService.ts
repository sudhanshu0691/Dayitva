// ============================================================
// Notification Service
// Handles notification APIs
// ============================================================

import api from "./api";
import { Notification } from "../types";

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get("/notifications");
    return response.data.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread-count");
    return response.data.data.unreadCount;
  }

  async markAsRead(id?: string): Promise<void> {
    await api.post("/notifications/mark-read", {
      id: id || undefined,
      all: !id,
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }
}

export default new NotificationService();
