"use client";

import React from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { 
  Building, ShieldCheck, Mail, Phone, KeyRound, 
  Trash, Clock, CheckCircle2, RefreshCw, ArrowLeft, 
  Layers, FileText 
} from "lucide-react";
import { motion } from "framer-motion";

export default function VendorProfile() {
  const router = useRouter();
  const { currentUser, language } = useApp();

  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-100">Access Denied</h2>
        <p className="text-xs text-slate-500 mt-2">Authenticated Corporate Vendor credentials required.</p>
      </div>
    );
  }

  const kycStatus = currentUser.kycStatus || "Under Review";

  const getStepIndex = (status: string) => {
    switch (status) {
      case "Pending": return 0;
      case "Under Review": return 1;
      case "Approved": return 2;
      case "Rejected": return 3;
      default: return 1;
    }
  };

  const steps = ["Submitted", "Under Review", "Approved"];

  const loginHistory = [
    { id: 1, event: "MetaMask Sign Handshake", ip: currentUser.ipAddress || "115.112.44.18", device: currentUser.deviceInfo || "Corporate Key (MacBook Pro)", date: "Today, 09:15 UTC", status: "success" },
    { id: 2, event: "MetaMask Sign Handshake", ip: "115.112.44.18", device: currentUser.deviceInfo || "Corporate Key (MacBook Pro)", date: "May 25, 11:00 UTC", status: "success" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => router.push("/vendor")}
        className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-teal-400 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Corporate Bid Space</span>
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Corporate Information & Filings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 rounded-xl bg-slate-900 border-2 border-teal-500/40 flex items-center justify-center mx-auto mb-4 relative">
              <Building className="w-10 h-10 text-teal-400" />
            </div>

            <h2 className="text-base font-black text-slate-800 dark:text-slate-100">{currentUser.companyName}</h2>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1">
              CIN: {currentUser.regNumber}
            </span>

            <div className="p-3 bg-muted/40 rounded-xl mt-6 space-y-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">PAN Card</span>
                <span className="text-slate-800 dark:text-slate-100 font-extrabold font-mono">{currentUser.pan}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">GSTIN ID</span>
                <span className="text-slate-800 dark:text-slate-100 font-extrabold font-mono">{currentUser.gst}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Turnover Cap</span>
                <span className="text-slate-800 dark:text-slate-100 font-extrabold">{currentUser.turnover}</span>
              </div>
            </div>
          </div>

          {/* KYC Documents locker IPFS List */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Verified KYC Document Vault
            </h3>
            <div className="space-y-2.5">
              <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-300 font-bold flex items-center justify-between gap-1.5">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>National Bank Solvency Certificate</span>
                </div>
                <span className="text-slate-500">IPFS Seal</span>
              </div>
              <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-300 font-bold flex items-center justify-between gap-1.5">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Audited Turnover Balance sheet (3Y)</span>
                </div>
                <span className="text-slate-500">IPFS Seal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: KYC stepper progress & Access logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Stepper block */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400 animate-pulse" />
              Corporate KYC Status Stepper
            </h3>
            
            <div className="flex items-center justify-between font-mono text-[10px] font-bold">
              {steps.map((step, idx) => {
                const currentIdx = getStepIndex(kycStatus);
                const isCompleted = idx <= currentIdx;
                const isRejected = kycStatus === "Rejected" && idx === 2;

                return (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                        isRejected ? "border-rose-500 text-rose-500 bg-rose-950/20" :
                        isCompleted ? "bg-teal-500 border-teal-500 text-slate-950" :
                        "border-slate-800 text-slate-500 bg-slate-950"
                      }`}>
                        {isCompleted && !isRejected ? "✓" : isRejected ? "✗" : idx + 1}
                      </div>
                      <span className={`mt-1.5 uppercase ${isCompleted ? "text-teal-400 font-black" : "text-slate-500"}`}>{step}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-[1px] flex-1 ${isCompleted ? "bg-teal-500" : "bg-slate-800"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Secure Handshake Access History */}
          <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 border-b border-border/85 pb-2.5 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Corporate Key Handshake Audit Logs
            </h3>
            <div className="space-y-3.5">
              {loginHistory.map((log) => (
                <div key={log.id} className="p-3 border border-border/60 rounded-xl bg-muted/10 flex items-start justify-between gap-3 text-[10px] font-mono leading-relaxed">
                  <div className="space-y-0.5">
                    <span className="font-extrabold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
