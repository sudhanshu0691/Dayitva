"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, Building, AlertTriangle, Ban, UserCheck,
  FileCheck, FileX, Activity, Bell, Search, Clock, Menu, X,
  LayoutDashboard, UserRound, FileText, ListChecks, LogOut,
  BarChart3, Eye, CheckCircle2, XCircle, ChevronRight, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
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
  chartData: {
    dailyVerifications: { date: string; approved: number; rejected: number }[];
    statusDistribution: { status: string; count: number }[];
  };
}

function AuditorDashboardContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [queues, setQueues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // If unauthorized, redirect to login
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

  const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/auditor/dashboard" },
    { name: "Vendor Verification", icon: Building, href: "/auditor/vendors" },
    { name: "Officer Verification", icon: Users, href: "/auditor/officers" },
    { name: "Blacklist Management", icon: Ban, href: "/auditor/blacklist" },
    { name: "Fraud Monitoring", icon: AlertTriangle, href: "/auditor/fraud" },
    { name: "Activity Logs", icon: Activity, href: "/auditor/logs" },
    { name: "Profile", icon: UserRound, href: "/auditor/profile" },
  ];

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
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-border transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="font-bold text-sm">Auditor Portal</span>
          </div>
          {auditor && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{auditor.fullName}</p>
          )}
        </div>
        <nav className="p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-red-950/20 hover:text-red-400 ${
                link.href === "/auditor/dashboard" ? "bg-red-950/20 text-red-400" : "text-muted-foreground"
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{link.name}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-red-950/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => router.push("/auditor/dashboard")}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="text-right text-xs">
                <p className="font-semibold text-foreground">{auditor?.fullName || "Auditor"}</p>
                <p className="text-muted-foreground">{auditor?.department || "Verification Authority"}</p>
              </div>
              <div className="w-8 h-8 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center">
                <UserRound className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          {/* Page title */}
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Verification Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time overview of verification operations</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {statCards.map((stat, index) => (
              <Card key={index} className={`${stat.bg} border`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-lg font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Queues + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Normal Queue */}
            <Card className="border border-border">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            {/* High Priority */}
            <Card className="border border-yellow-800/30">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            {/* Fraud Flagged */}
            <Card className="border border-red-800/30">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => router.push("/auditor/vendors")}
              className="p-3 bg-muted/50 border border-border rounded-xl text-left hover:bg-red-950/10 hover:border-red-800/30 transition-all"
            >
              <Building className="w-5 h-5 text-teal-400 mb-1" />
              <p className="text-xs font-bold text-foreground">Verify Vendors</p>
              <p className="text-[10px] text-muted-foreground">{stats.pendingRequests} pending</p>
            </button>
            <button
              onClick={() => router.push("/auditor/officers")}
              className="p-3 bg-muted/50 border border-border rounded-xl text-left hover:bg-red-950/10 hover:border-red-800/30 transition-all"
            >
              <Users className="w-5 h-5 text-blue-400 mb-1" />
              <p className="text-xs font-bold text-foreground">Verify Officers</p>
              <p className="text-[10px] text-muted-foreground">{stats.officerVerifications} verified</p>
            </button>
            <button
              onClick={() => router.push("/auditor/blacklist")}
              className="p-3 bg-muted/50 border border-border rounded-xl text-left hover:bg-red-950/10 hover:border-red-800/30 transition-all"
            >
              <Ban className="w-5 h-5 text-purple-400 mb-1" />
              <p className="text-xs font-bold text-foreground">Blacklist</p>
              <p className="text-[10px] text-muted-foreground">{stats.blacklistedUsers} entries</p>
            </button>
            <button
              onClick={() => router.push("/auditor/fraud")}
              className="p-3 bg-muted/50 border border-border rounded-xl text-left hover:bg-red-950/10 hover:border-red-800/30 transition-all"
            >
              <AlertTriangle className="w-5 h-5 text-orange-400 mb-1" />
              <p className="text-xs font-bold text-foreground">Fraud Monitor</p>
              <p className="text-[10px] text-muted-foreground">{stats.fraudAttempts} attempts</p>
            </button>
          </div>

          {/* Recent Notifications */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-red-400" />
                Recent Notifications
              </h3>
              <div className="space-y-2">
                {notifications.length > 0 ? notifications.slice(0, 5).map((notif: any) => (
                  <div key={notif.id} className={`p-2 rounded-lg text-xs ${notif.read ? "bg-muted/30" : "bg-red-950/20 border border-red-800/20"}`}>
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
            </CardContent>
          </Card>
        </main>
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