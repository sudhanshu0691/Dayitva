"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, Building, AlertTriangle, Ban,
  Bell, Clock, UserRound, RefreshCw
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import auditorService from "@/services/auditorService";

interface Analytics {
  stats: {
    totalVendors: number;
    totalOfficers: number;
    pendingRequests: number;
    approvedToday: number;
    totalRejected: number;
    fraudAttempts: number;
    blacklistedUsers: number;
    vendorVerifications: number;
    officerVerifications: number;
  };
}

interface QueueItem {
  id: string;
  user?: {
    companyName?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  fraudReason?: string;
}

interface AuditorNotif {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
  timestamp?: string;
}

function AuditorDashboardContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [queues, setQueues] = useState<{
    normal?: QueueItem[];
    highPriority?: QueueItem[];
    fraudFlagged?: QueueItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditor, setAuditor] = useState<{
    fullName?: string;
    department?: string;
    officialEmail?: string;
    email?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<AuditorNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsData, queuesData, notifs] = await Promise.all([
        auditorService.getAnalytics(),
        auditorService.getVerificationQueues(),
        auditorService.getNotifications(1, 5),
      ]);
      setAnalytics(analyticsData);
      setQueues(queuesData);
      setNotifications(notifs.notifications || []);
      setUnreadCount(notifs.unread || 0);
    } catch {
      localStorage.removeItem("auditorToken");
      localStorage.removeItem("auditor");
      router.push("/auditor/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem("auditor");
    if (!stored) {
      router.push("/auditor/login");
      return;
    }
    setAuditor(JSON.parse(stored));
    fetchData();
  }, [router, fetchData]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await auditorService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await auditorService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">Loading auditor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { stats } = analytics;

  const statCards = [
    { label: "Pending requests", value: stats.pendingRequests, color: "text-status-pending" },
    { label: "Approved today", value: stats.approvedToday, color: "text-status-approved" },
    { label: "Total rejected", value: stats.totalRejected, color: "text-status-rejected" },
    { label: "Fraud attempts", value: stats.fraudAttempts, color: "text-accent" },
    { label: "Blacklisted", value: stats.blacklistedUsers, color: "text-muted-foreground" },
    { label: "Vendor verifications", value: stats.vendorVerifications, color: "text-primary" },
    { label: "Officer verifications", value: stats.officerVerifications, color: "text-primary" },
    { label: "Total accounts", value: stats.totalVendors + stats.totalOfficers, color: "text-foreground" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Auditor dashboard
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Real-time overview of verification operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell with Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-lg shadow-dropdown z-50 overflow-hidden">
                <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-[11px] text-primary hover:underline font-semibold">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          handleMarkAsRead(notif.id);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 text-left transition-colors hover:bg-muted cursor-pointer ${
                          notif.read ? "opacity-60" : "bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[13px] text-foreground line-clamp-1 font-semibold">{notif.title}</span>
                          {!notif.read && <span className="w-1.5 h-1.5 bg-primary shrink-0 mt-1 rounded-full" />}
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {new Date(notif.createdAt || notif.timestamp || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-[13px] text-muted-foreground">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="text-right text-[13px]">
            <p className="font-medium text-foreground">{auditor?.fullName || "Auditor"}</p>
            <p className="text-muted-foreground">{auditor?.department || "Verification authority"}</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid with left border accents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card border-border">
            <p className="text-[18px] font-medium text-foreground">{stat.value}</p>
            <p className="section-label text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Queues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Normal Queue */}
        <div className="border border-border bg-card p-5">
          <h3 className="text-[13px] font-medium text-foreground flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            Normal queue
            <span className="text-[11px] text-muted-foreground ml-auto">{queues?.normal?.length || 0} pending</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.normal?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 text-[13px]">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                </div>
                <span className="text-[11px] text-primary">{item.user?.role}</span>
              </div>
            ))}
            {(!queues?.normal || queues.normal.length === 0) && (
              <p className="text-[13px] text-muted-foreground text-center py-4">No pending items</p>
            )}
          </div>
        </div>

        {/* High Priority */}
        <div className="border border-status-pending/50 bg-card p-5">
          <h3 className="text-[13px] font-medium text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-status-pending" />
            High priority
            <span className="text-[11px] text-muted-foreground ml-auto">{queues?.highPriority?.length || 0} items</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.highPriority?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-status-pending-bg/30 text-[13px]">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                </div>
                <span className="text-[11px] text-status-pending">Re-verify</span>
              </div>
            ))}
            {(!queues?.highPriority || queues.highPriority.length === 0) && (
              <p className="text-[13px] text-muted-foreground text-center py-4">No high priority items</p>
            )}
          </div>
        </div>

        {/* Fraud Flagged */}
        <div className="border border-status-rejected/50 bg-card p-5">
          <h3 className="text-[13px] font-medium text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-status-rejected" />
            Fraud flagged
            <span className="text-[11px] text-muted-foreground ml-auto">{queues?.fraudFlagged?.length || 0} items</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.fraudFlagged?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-status-rejected-bg/30 text-[13px]">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                  {item.fraudReason && <p className="text-status-rejected text-[11px]">{item.fraudReason}</p>}
                </div>
                <span className="text-[11px] text-status-rejected">FRAUD</span>
              </div>
            ))}
            {(!queues?.fraudFlagged || queues.fraudFlagged.length === 0) && (
              <p className="text-[13px] text-muted-foreground text-center py-4">No flagged items</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[18px] font-medium text-foreground mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => router.push("/auditor/vendors")}
            className="border border-border bg-card p-4 text-left hover:bg-muted transition-colors">
            <Building className="w-8 h-8 text-primary mb-2" />
            <p className="text-[13px] font-medium text-foreground">Verify vendors</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stats.pendingRequests} pending</p>
          </button>
          <button onClick={() => router.push("/auditor/officers")}
            className="border border-border bg-card p-4 text-left hover:bg-muted transition-colors">
            <Users className="w-8 h-8 text-primary mb-2" />
            <p className="text-[13px] font-medium text-foreground">Verify officers</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stats.officerVerifications} verified</p>
          </button>
          <button onClick={() => router.push("/auditor/blacklist")}
            className="border border-border bg-card p-4 text-left hover:bg-muted transition-colors">
            <Ban className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-[13px] font-medium text-foreground">Blacklist</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stats.blacklistedUsers} entries</p>
          </button>
          <button onClick={() => router.push("/auditor/fraud")}
            className="border border-border bg-card p-4 text-left hover:bg-muted transition-colors">
            <AlertTriangle className="w-8 h-8 text-accent mb-2" />
            <p className="text-[13px] font-medium text-foreground">Fraud monitor</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stats.fraudAttempts} attempts</p>
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-[18px] font-medium text-foreground mb-4">Recent notifications</h2>
        <div className="border border-border bg-card p-5">
          <div className="space-y-2">
            {notifications.length > 0 ? notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className={`p-3 text-[13px] ${notif.read ? "bg-muted/30" : "bg-primary/5 border border-primary/20"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{notif.title}</p>
                  {!notif.read && <span className="w-1.5 h-1.5 bg-primary" />}
                </div>
                <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(notif.createdAt || notif.timestamp || "").toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-[13px] text-muted-foreground text-center py-4">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditorDashboardPage() {
  return (
    <ErrorBoundary>
      <AuditorDashboardContent />
    </ErrorBoundary>
  );
}