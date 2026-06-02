"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, Building, AlertTriangle, Ban, UserCheck,
  FileCheck, FileX, Activity, Bell, Search, Clock, Menu, X,
  LayoutDashboard, UserRound, FileText, ListChecks, LogOut,
  BarChart3, Eye, CheckCircle2, XCircle, ChevronRight, RefreshCw,
  Landmark, BadgeCheck, ExternalLink
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
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

function AuditorDashboardContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [queues, setQueues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditor, setAuditor] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("auditor");
    if (!stored) {
      router.push("/auditor/login");
      return;
    }
    setAuditor(JSON.parse(stored));
    fetchData();
  }, []);

  const fetchData = async () => {
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
    } catch (err) {
      localStorage.removeItem("auditorToken");
      localStorage.removeItem("auditor");
      router.push("/auditor/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auditorService.logout(localStorage.getItem("auditorRefreshToken") || undefined);
    } catch {}
    localStorage.removeItem("auditorToken");
    localStorage.removeItem("auditorRefreshToken");
    localStorage.removeItem("auditor");
    router.push("/auditor/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-red-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-mono">Loading Auditor Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { stats } = analytics;

  const statCards = [
    { label: "Pending Requests", value: stats.pendingRequests, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-950/20 border-yellow-800/30" },
    { label: "Approved Today", value: stats.approvedToday, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-800/30" },
    { label: "Total Rejected", value: stats.totalRejected, icon: XCircle, color: "text-red-400", bg: "bg-red-950/20 border-red-800/30" },
    { label: "Fraud Attempts", value: stats.fraudAttempts, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-950/20 border-orange-800/30" },
    { label: "Blacklisted", value: stats.blacklistedUsers, icon: Ban, color: "text-purple-400", bg: "bg-purple-950/20 border-purple-800/30" },
    { label: "Vendor Verifications", value: stats.vendorVerifications, icon: Building, color: "text-teal-400", bg: "bg-teal-950/20 border-teal-800/30" },
    { label: "Officer Verifications", value: stats.officerVerifications, icon: Users, color: "text-blue-400", bg: "bg-blue-950/20 border-blue-800/30" },
    { label: "Total Accounts", value: stats.totalVendors + stats.totalOfficers, icon: Users, color: "text-sky-400", bg: "bg-sky-950/20 border-sky-800/30" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-400" />
            Auditor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of verification operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Auditor Info */}
          <div className="text-right text-xs">
            <p className="font-semibold text-foreground">{auditor?.fullName || "Auditor"}</p>
            <p className="text-muted-foreground">{auditor?.department || "Verification Authority"}</p>
          </div>
          <div className="w-10 h-10 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center">
            <UserRound className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className={`rounded-2xl border ${stat.bg} bg-card/40 p-4`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-black text-foreground">{stat.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Queues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Normal Queue */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-400" />
            Normal Queue
            <span className="text-xs text-muted-foreground ml-auto">{queues?.normal?.length || 0} pending</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.normal?.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                </div>
                <span className="text-[10px] font-mono uppercase text-blue-400">{item.user?.role}</span>
              </div>
            ))}
            {(!queues?.normal || queues.normal.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No pending items</p>
            )}
          </div>
        </div>

        {/* High Priority */}
        <div className="rounded-2xl border border-yellow-800/30 bg-card/40 p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            High Priority
            <span className="text-xs text-muted-foreground ml-auto">{queues?.highPriority?.length || 0} items</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.highPriority?.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-950/20 rounded-lg text-xs">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                </div>
                <span className="text-[10px] font-mono text-yellow-400">Re-verify</span>
              </div>
            ))}
            {(!queues?.highPriority || queues.highPriority.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No high priority items</p>
            )}
          </div>
        </div>

        {/* Fraud Flagged */}
        <div className="rounded-2xl border border-red-800/30 bg-card/40 p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Fraud Flagged
            <span className="text-xs text-muted-foreground ml-auto">{queues?.fraudFlagged?.length || 0} items</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queues?.fraudFlagged?.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-red-950/20 rounded-lg text-xs">
                <div>
                  <p className="font-medium text-foreground">{item.user?.companyName || item.user?.name}</p>
                  <p className="text-muted-foreground">{item.user?.email}</p>
                  {item.fraudReason && <p className="text-red-400 text-[10px]">{item.fraudReason}</p>}
                </div>
                <span className="text-[10px] font-mono text-red-400">FRAUD</span>
              </div>
            ))}
            {(!queues?.fraudFlagged || queues.fraudFlagged.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No flagged items</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => router.push("/auditor/vendors")}
            className="rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:bg-card/60 hover:border-red-800/30 transition-all"
          >
            <Building className="w-8 h-8 text-teal-400 mb-2" />
            <p className="text-xs font-bold text-foreground">Verify Vendors</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.pendingRequests} pending</p>
          </button>
          <button
            onClick={() => router.push("/auditor/officers")}
            className="rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:bg-card/60 hover:border-red-800/30 transition-all"
          >
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-xs font-bold text-foreground">Verify Officers</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.officerVerifications} verified</p>
          </button>
          <button
            onClick={() => router.push("/auditor/blacklist")}
            className="rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:bg-card/60 hover:border-red-800/30 transition-all"
          >
            <Ban className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-xs font-bold text-foreground">Blacklist</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.blacklistedUsers} entries</p>
          </button>
          <button
            onClick={() => router.push("/auditor/fraud")}
            className="rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:bg-card/60 hover:border-red-800/30 transition-all"
          >
            <AlertTriangle className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-xs font-bold text-foreground">Fraud Monitor</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.fraudAttempts} attempts</p>
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Recent Notifications</h2>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <div className="space-y-2">
            {notifications.length > 0 ? notifications.slice(0, 5).map((notif: any) => (
              <div key={notif.id} className={`p-3 rounded-lg text-xs ${notif.read ? "bg-muted/30" : "bg-red-950/20 border border-red-800/20"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  {!notif.read && <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />}
                </div>
                <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">No notifications</p>
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