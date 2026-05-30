"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Bell,
  ClipboardList,
  ShieldCheck,
  UserCircle2,
  Wallet,
  Landmark,
  Building2,
  Globe,
} from "lucide-react";

const navBase = "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors";

export const PortalSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, walletConnected, walletBalance } = useApp();

  if (!currentUser || currentUser.role === "public") {
    return null;
  }

  const officerNav = [
    { href: "/admin", label: "Officer Desk", icon: Landmark },
    { href: "/admin/create-tender", label: "Create Tender", icon: ClipboardList },
    { href: "/admin/profile", label: "Officer Profile", icon: UserCircle2 },
    { href: "/verify", label: "Verification Center", icon: ShieldCheck },
  ];

  const vendorNav = [
    { href: "/vendor", label: "Vendor Workspace", icon: Building2 },
    { href: "/vendor/profile", label: "Company Profile", icon: UserCircle2 },
    { href: "/dashboard", label: "Public Market", icon: LayoutDashboard },
    { href: "/verify", label: "Audit Verification", icon: ShieldCheck },
  ];

  const navItems = currentUser.role === "officer" ? officerNav : vendorNav;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4 border-r border-border/80 bg-card/40 backdrop-blur-md px-4 py-5 min-h-[calc(100vh-4.5rem)] sticky top-[4.5rem]">
      <div className="rounded-2xl border border-border/80 bg-slate-950/70 p-4 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Portal Session</div>
        <div className="mt-2 text-sm font-black text-slate-100 truncate">{currentUser.name}</div>
        <div className="mt-1 text-[11px] text-slate-400 truncate">{currentUser.email}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-950/40 px-2 py-1 text-[10px] font-bold text-teal-300 uppercase tracking-wider">
            {currentUser.role}
          </span>
          {walletConnected ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              <Wallet className="w-3 h-3" />
              {walletBalance}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Wallet Inactive
            </span>
          )}
        </div>
      </div>

      <nav className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 px-1">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${navBase} ${active ? "bg-teal-500/10 text-teal-300 border border-teal-500/20" : "text-slate-300 hover:bg-slate-900/70 hover:text-white"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/80 bg-slate-950/70 p-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Globe className="w-4 h-4 text-teal-300" />
          Secure Workspace
        </div>
        <p className="mt-2 leading-relaxed">
          Notification stream, role controls, and connected wallet state remain active until logout or session expiry.
        </p>
      </div>
    </aside>
  );
};
