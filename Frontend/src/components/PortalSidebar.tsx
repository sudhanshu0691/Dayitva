"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  UserCircle2,
  Wallet,
  Landmark,
  Building2,
  Globe,
  ChevronRight,
} from "lucide-react";

export const PortalSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, walletConnected, walletBalance } = useApp();

  if (!currentUser) return null;

  const officerNav = [
    { href: "/officer", label: "Officer desk", icon: Landmark },
    { href: "/officer/create-tender", label: "Create tender", icon: ClipboardList },
    { href: "/officer/profile", label: "Officer profile", icon: UserCircle2 },
  ];

  const vendorNav = [
    { href: "/vendor", label: "Vendor workspace", icon: Building2 },
    { href: "/vendor/dashboard", label: "Vendor dashboard", icon: LayoutDashboard },
    { href: "/vendor/profile", label: "Company profile", icon: UserCircle2 },
  ];

  const auditorNav = [
    { href: "/auditor/dashboard", label: "Auditor dashboard", icon: ShieldCheck },
    { href: "/auditor/vendors", label: "Vendors", icon: Building2 },
    { href: "/auditor/officers", label: "Officers", icon: Landmark },
    { href: "/auditor/blacklist", label: "Blacklist", icon: ShieldCheck },
    { href: "/auditor/fraud", label: "Fraud monitor", icon: ShieldCheck },
    { href: "/auditor/logs", label: "Activity logs", icon: ClipboardList },
  ];

  type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  let navItems: NavItem[];

  if (currentUser.role === "officer") navItems = officerNav;
  else if (currentUser.role === "vendor") navItems = vendorNav;
  else if (currentUser.role === "auditor") navItems = auditorNav;
  else navItems = [];

  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 flex-col border-r border-border bg-card min-h-[calc(100vh-8rem)]">
      {/* Session Info */}
      <div className="p-5 border-b border-border">
        <p className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">Portal session</p>
        <p className="text-body-sm text-foreground mt-2 font-semibold">{currentUser.name}</p>
        <p className="text-caption text-muted-foreground truncate mt-0.5">{currentUser.email}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1 border border-accent/30 bg-accent/5 px-2.5 py-0.5 text-caption text-accent font-semibold rounded-full">
            {currentUser.role}
          </span>
          {walletConnected ? (
            <span className="inline-flex items-center gap-1 border border-success/30 bg-success/5 px-2.5 py-0.5 text-caption text-success font-semibold rounded-full">
              <Wallet className="w-3 h-3" />
              {walletBalance}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 border border-border bg-surface-container-low px-2.5 py-0.5 text-caption text-muted-foreground rounded-full">
              Wallet inactive
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-3 flex-1">
        <p className="text-caption text-muted-foreground px-5 py-2 uppercase tracking-wider font-semibold">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-body-sm transition-all duration-200 border-r-2 ${
                active
                  ? "bg-accent/5 text-accent border-r-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low border-r-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-accent" : "text-muted-foreground"}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto p-5 border-t border-border">
        <div className="flex items-center gap-2 text-caption text-foreground font-semibold">
          <Globe className="w-4 h-4 text-accent" />
          Secure workspace
        </div>
        <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed">
          All sessions and wallet states persist until logout.
        </p>
      </div>
    </aside>
  );
};
