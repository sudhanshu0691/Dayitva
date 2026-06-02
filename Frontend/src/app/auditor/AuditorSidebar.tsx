"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck, LayoutDashboard, Users, Building, Ban,
  AlertTriangle, Activity, LogOut, ChevronLeft, ChevronRight,
  UserRound, FileText, Search, Bell
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/auditor/dashboard" },
  { label: "Vendors", icon: Building, href: "/auditor/vendors" },
  { label: "Officers", icon: Users, href: "/auditor/officers" },
  { label: "Profile", icon: UserRound, href: "/auditor/profile" },
  { label: "Blacklist", icon: Ban, href: "/auditor/blacklist" },
  { label: "Fraud Monitor", icon: AlertTriangle, href: "/auditor/fraud" },
  { label: "Activity Logs", icon: Activity, href: "/auditor/logs" },
];

export default function AuditorSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [auditor, setAuditor] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auditor");
    if (stored) {
      try {
        setAuditor(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auditorRefreshToken");
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auditor/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auditorToken")}` },
          body: JSON.stringify({ refreshToken: token }),
        });
      }
    } catch {}
    localStorage.removeItem("auditorToken");
    localStorage.removeItem("auditorRefreshToken");
    localStorage.removeItem("auditor");
    router.push("/auditor/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-card/60 backdrop-blur-xl border-r border-border/60 z-50 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[260px]"}`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b border-border/40`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold text-foreground">Auditor Portal</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Auditor Info */}
      {!collapsed && auditor && (
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center shrink-0">
              <UserRound className="w-4 h-4 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{auditor.fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{auditor.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-red-950/30 text-red-300 border border-red-800/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-red-400" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border/40">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-950/20 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}