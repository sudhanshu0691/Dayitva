"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { 
  User, Landmark, ShieldCheck, Mail, ShieldAlert, KeyRound, 
  Smartphone, Trash, Clock, CheckCircle2, XCircle, RefreshCw, 
  ArrowLeft, Laptop 
} from "lucide-react";
import { motion } from "framer-motion";

export default function OfficerProfile() {
  const router = useRouter();
  const { currentUser, language } = useApp();
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionsTerminated, setSessionsTerminated] = useState(false);

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-100">Access Denied</h2>
        <p className="text-xs text-slate-500 mt-2">Authenticated Govt Officer credentials required.</p>
      </div>
    );
  }

  const handleTerminateOtherSessions = () => {
    setSessionLoading(true);
    setTimeout(() => {
      setSessionLoading(false);
      setSessionsTerminated(true);
    }, 1500);
  };

  const loginHistory = [
    { id: 1, event: "Successful Aadhaar e-Sign Verification", ip: currentUser.ipAddress || "10.14.89.201", device: currentUser.deviceInfo || "NIC Sec Workstation", date: "Today, 00:10 UTC", status: "success" },
    { id: 2, event: "Active Session Refresh", ip: currentUser.ipAddress || "10.14.89.201", device: currentUser.deviceInfo || "NIC Sec Workstation", date: "Yesterday, 18:30 UTC", status: "success" },
    { id: 3, event: "Blocked Malicious Password Entry", ip: "192.18.23.41 (MUMBAI-NET)", device: "Firefox on Android", date: "Yesterday, 14:12 UTC", status: "failed" },
    { id: 4, event: "Failed OTP Attempt (Rate Limited)", ip: "192.18.23.41 (MUMBAI-NET)", device: "Firefox on Android", date: "Yesterday, 14:10 UTC", status: "failed" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => router.push("/admin")}
        className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-teal-400 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Administrative Dashboard</span>
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Personal Card & Keys */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-orange-500/40 flex items-center justify-center mx-auto mb-4 relative">
              <User className="w-10 h-10 text-[#FF9933]" />
              <span className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-white" title="Keys active">
                ✓
              </span>
            </div>

            <h2 className="text-base font-black text-slate-800 dark:text-slate-100">{currentUser.name}</h2>
            <span className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider block mt-1">
              {currentUser.designation}
            </span>

            <div className="p-3 bg-muted/40 rounded-xl mt-6 space-y-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Ministry</span>
                <span className="text-slate-800 dark:text-slate-100 font-extrabold text-right truncate max-w-[150px]">{currentUser.ministry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-mono">NIC E-Mail</span>
                <span className="text-slate-800 dark:text-slate-100 font-extrabold">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Key Permissions */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-teal-400" />
              Administrative Permissions Ledger
            </h3>
            <div className="space-y-2">
              {currentUser.permissions?.map((p, idx) => (
                <div key={idx} className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-teal-400 font-bold tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Audits & Session controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Security Session Manager */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-[#FF9933]" />
              Active Session Administration
            </h3>
            <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200">NIC SECURE HOST VPN</span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">IP: {currentUser.ipAddress} • {currentUser.deviceInfo}</span>
                </div>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                  CURRENT ACTIVE
                </span>
              </div>

              {!sessionsTerminated ? (
                <button
                  onClick={handleTerminateOtherSessions}
                  className="w-full flex items-center justify-center space-x-2 text-[10px] font-bold font-mono py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-all"
                  disabled={sessionLoading}
                >
                  {sessionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting termination signals...</span>
                    </>
                  ) : (
                    <span>Terminate All Other Administrative Sessions</span>
                  )}
                </button>
              ) : (
                <div className="p-2 bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono rounded-lg text-center">
                  All other sessions terminated successfully. Security keys updated.
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Login History & Security Logs */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Administrative Security Audit Logs
            </h3>
            <div className="space-y-3.5">
              {loginHistory.map((log) => (
                <div key={log.id} className="p-3 border border-border/60 rounded-xl bg-muted/10 flex items-start justify-between gap-3 text-[10px] font-mono leading-relaxed">
                  <div className="space-y-0.5">
                    <span className={`font-extrabold flex items-center gap-1.5 ${
                      log.status === "success" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {log.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      {log.event}
                    </span>
                    <span className="block text-slate-500">{log.device} • {log.ip}</span>
                  </div>
                  <span className="text-slate-500 text-right shrink-0">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
