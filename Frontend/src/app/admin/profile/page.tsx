"use client";

import React from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { User, Mail, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";

export default function OfficerProfile() {
  const router = useRouter();
  const { currentUser } = useApp();

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Government Officer credentials required.</p>
        <button onClick={() => router.push("/login")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 space-y-6">
      <button onClick={() => router.push("/admin")} className="flex items-center space-x-1 text-xs font-bold text-muted-foreground hover:text-teal-400 font-mono">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-orange-500/40 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-[#FF9933]" />
        </div>
        <h2 className="text-base font-black text-foreground">{currentUser.name}</h2>
        <span className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider block mt-1">{currentUser.designation}</span>

        <div className="p-3 bg-muted/40 rounded-xl mt-6 space-y-2 text-left text-xs font-semibold text-foreground">
          <div className="flex justify-between border-b border-border/40 pb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Ministry</span>
            <span className="font-extrabold text-right">{currentUser.ministry}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Email</span>
            <span className="font-extrabold">{currentUser.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Role</span>
            <span className="font-extrabold uppercase">{currentUser.role}</span>
          </div>
        </div>
      </div>

      {currentUser.permissions && currentUser.permissions.length > 0 && (
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider font-mono text-foreground border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-teal-400" />
            Permissions
          </h3>
          <div className="space-y-2">
            {currentUser.permissions.map((p, idx) => (
              <div key={idx} className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-teal-400 font-bold tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}