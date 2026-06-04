"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck, LayoutDashboard, Users, Building, Ban, AlertTriangle, 
  ClipboardList, LogOut, ChevronLeft, ChevronRight, Globe, Wallet
} from "lucide-react";
import auditorService from "@/services/auditorService";

const sidebarLinks = [
  { href: "/auditor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auditor/vendors", label: "Vendors", icon: Building },
  { href: "/auditor/officers", label: "Officers", icon: Users },
  { href: "/auditor/blacklist", label: "Blacklist", icon: Ban },
  { href: "/auditor/fraud", label: "Fraud monitor", icon: AlertTriangle },
  { href: "/auditor/logs", label: "Activity logs", icon: ClipboardList },
];

export default function AuditorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [auditor, setAuditor] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auditor");
    if (stored) {
      try { setAuditor(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auditorService.logout(localStorage.getItem("auditorRefreshToken") || undefined);
    } catch {}
    localStorage.removeItem("auditorToken");
    localStorage.removeItem("auditorRefreshToken");
    localStorage.removeItem("auditor");
    router.push("/auditor/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[220px]"}`}>
      {/* Session Info - like vendor/officer portal */}
      {!collapsed && auditor && (
        <div className="p-4 border-b border-sidebar-border">
          <p className="text-label-sm text-sidebar-muted uppercase tracking-wider font-semibold">Portal session</p>
          <p className="text-body-sm text-foreground mt-2 font-semibold">{auditor.fullName || "Auditor"}</p>
          <p className="text-label-sm text-sidebar-muted truncate mt-0.5">{auditor.officialEmail || auditor.email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 border border-red-800/50 bg-red-950/30 px-2.5 py-0.5 text-label-sm text-red-400 font-semibold rounded-full">
              <ShieldCheck className="w-3 h-3" />
              auditor
            </span>
            <span className="inline-flex items-center gap-1 border border-sidebar-border bg-sidebar px-2.5 py-0.5 text-label-sm text-sidebar-muted rounded-full">
              <Wallet className="w-3 h-3" />
              {auditor.department || "Authority"}
            </span>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <span className="section-label text-sidebar-muted">Auditor portal</span>}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-muted transition-colors text-sidebar-muted">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="py-2">
        <p className="text-label-sm text-sidebar-muted px-4 py-2 uppercase tracking-wider font-semibold">Navigation</p>
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors border-l-2 ${
                isActive
                  ? "bg-primary/10 text-primary border-l-primary"
                  : "text-foreground hover:bg-muted border-l-transparent"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-sidebar-muted"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border text-label-sm text-sidebar-muted">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Secure workspace
          </div>
          <p className="mt-1 leading-relaxed">
            All sessions persist until logout.
          </p>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-sidebar-border">
        <button onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] text-sidebar-muted hover:bg-destructive/10 hover:text-destructive transition-colors ${collapsed ? "justify-center" : ""}`}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
