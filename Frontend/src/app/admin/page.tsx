"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, User, Mail, Cpu, Plus, ChevronRight, 
  ArrowUpRight, AlertCircle, ShieldCheck, Lock,
  CheckCircle2, XCircle, AlertTriangle, Clock
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import tenderService from "@/services/tenderService";
import userService from "@/services/userService";

export default function OfficerDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    
    const fetchData = async () => {
      try {
        const tenderRes = await tenderService.listTenders();
        setTenders(tenderRes.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Government Officer credentials required.</p>
        <button onClick={() => router.push("/login/organizer")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">
          Go to Officer Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isKycApproved = currentUser.kycStatus === "Approved";
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-950/40 border border-orange-800/40 rounded-xl flex items-center justify-center text-[#FF9933]">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider font-mono">OFFICER DESK</span>
            <h1 className="text-lg font-black mt-0.5">{currentUser.name}</h1>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {currentUser.email}
            </span>
            {currentUser.designation && (
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                {currentUser.designation} • {currentUser.ministry || ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KYC Status Banner */}
      <div className={`mb-8 p-4 rounded-2xl border ${
        isKycApproved 
          ? "bg-emerald-950/10 border-emerald-800/20" 
          : "bg-amber-950/10 border-amber-800/20"
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {isKycApproved ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            )}
            <div>
              <p className="font-bold text-sm text-foreground">
                {isKycApproved ? "KYC Verified ✓" : "KYC Verification Required"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isKycApproved 
                  ? "Your identity has been verified. You can create and manage tenders."
                  : `Current KYC Status: ${currentUser.kycStatus || "Pending"}. Complete KYC to create tenders.`
                }
              </p>
            </div>
          </div>
          {!isKycApproved && (
            <button
              onClick={() => router.push("/admin/profile")}
              className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              Complete KYC Now
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-white">
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Tenders</span>
          <span className="block text-xl font-black font-mono mt-1">{tenders.length}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Active</span>
          <span className="block text-xl font-black font-mono mt-1 text-teal-400">
            {tenders.filter((t: any) => t.status === "Open" || t.status === "UnderEvaluation").length}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Bids Received</span>
          <span className="block text-xl font-black font-mono mt-1 text-indigo-400">
            {tenders.reduce((acc: number, t: any) => acc + (t.bidsCount || 0), 0)}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">KYC</span>
          <span className={`block text-xl font-black font-mono mt-1 ${isKycApproved ? "text-emerald-400" : "text-amber-400"}`}>
            {currentUser.kycStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Create Tender Button - Disabled if KYC not approved */}
      <div className="mb-6">
        <button
          onClick={() => isKycApproved && router.push("/admin/create-tender")}
          disabled={!isKycApproved}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono transition-all ${
            isKycApproved
              ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:shadow-lg"
              : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
          }`}
        >
          {isKycApproved ? (
            <>
              <Plus className="w-4 h-4" />
              Create New Tender
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              KYC Required to Create Tender
            </>
          )}
        </button>
        {!isKycApproved && (
          <p className="text-[10px] text-amber-400 font-mono text-center mt-2">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Your KYC must be approved by an Auditor before you can create tenders.
            <button onClick={() => router.push("/admin/profile")} className="underline ml-1 hover:text-amber-300">
              Go to Profile
            </button>
          </p>
        )}
      </div>

      {/* Tenders Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/85 bg-slate-900/10 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider font-mono text-foreground">My Tenders</span>
          <span className="text-[10px] text-muted-foreground font-mono">{tenders.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-muted-foreground uppercase">
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Bids</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {tenders.map((tender: any) => (
                <tr key={tender.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-400">{tender.id}</td>
                  <td className="p-3 font-bold truncate max-w-xs">{tender.title}</td>
                  <td className="p-3 font-mono">{formatCurrency(tender.budget)}</td>
                  <td className="p-3">{tender.bidsCount || 0}</td>
                  <td className="p-3">
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                      tender.status === "Open" ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20" :
                      tender.status === "UnderEvaluation" ? "bg-amber-950/60 text-amber-400 border-amber-500/20" :
                      tender.status === "Awarded" ? "bg-teal-950/60 text-teal-400 border-teal-500/20" :
                      "bg-slate-900 text-slate-400 border-slate-700"
                    }`}>
                      {tender.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="p-1 border border-border rounded hover:bg-slate-800 hover:text-teal-400 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tenders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No tenders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-5 rounded-2xl border border-border/80 bg-slate-950 text-white">
        <h3 className="text-xs font-black uppercase tracking-wider font-mono text-orange-400 mb-4 flex items-center gap-1.5">
          <Landmark className="w-4 h-4" /> Quick Actions
        </h3>
        <button onClick={() => isKycApproved ? router.push("/admin/create-tender") : router.push("/admin/profile")}
          className="w-full flex items-center justify-between p-3 border border-slate-900 rounded-xl hover:border-orange-500/30 text-xs font-bold font-mono text-slate-200 mb-3">
          <div className="flex items-center gap-2.5">
            {isKycApproved ? <Plus className="w-4 h-4 text-[#FF9933]" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
            <span>{isKycApproved ? "Create New Tender" : "Complete KYC Verification"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        <button onClick={() => router.push("/admin/profile")}
          className="w-full flex items-center justify-between p-3 border border-slate-900 rounded-xl hover:border-orange-500/30 text-xs font-bold font-mono text-slate-200">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-blue-400" />
            <span>View Profile & Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}