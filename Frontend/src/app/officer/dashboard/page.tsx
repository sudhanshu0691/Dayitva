"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, Plus, AlertCircle, ShieldCheck, CheckCircle2,
  XCircle, Clock, ExternalLink, FileText, BarChart3, 
  RefreshCw, ExternalLink as LinkIcon
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, awarded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    
    const fetchData = async () => {
      try {
        const tenderRes = await tenderService.listTenders();
        const tendersData = tenderRes.data || [];
        setTenders(tendersData);
        
        setStats({
          total: tendersData.length,
          open: tendersData.filter((t: any) => t.status === "Open").length,
          closed: tendersData.filter((t: any) => t.status === "Closed" || t.status === "UnderEvaluation").length,
          awarded: tendersData.filter((t: any) => t.status === "Awarded").length,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hydrated]);

  const isKycApproved = currentUser?.kycStatus === "Approved";

  const statCards = [
    { label: "Total Tenders", value: stats.total, icon: FileText, color: "text-blue-400", bg: "bg-blue-950/20 border-blue-800/30" },
    { label: "Open", value: stats.open, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-800/30" },
    { label: "Closed/Review", value: stats.closed, icon: CheckCircle2, color: "text-amber-400", bg: "bg-amber-950/20 border-amber-800/30" },
    { label: "Awarded", value: stats.awarded, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-950/20 border-purple-800/30" },
  ];

  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-mono">Loading Officer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-teal-400" />
            Officer Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tenders, view bids, and oversee procurement operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <p className="font-semibold text-foreground">{currentUser?.name || "Officer"}</p>
            <p className="text-muted-foreground">{currentUser?.ministry || "Government Department"}</p>
          </div>
          <div className="w-10 h-10 bg-teal-950/50 border border-teal-800/40 rounded-full flex items-center justify-center">
            <Landmark className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* KYC Status Banner */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
        {!isKycApproved ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-300">KYC Verification Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                You must complete KYC verification before you can create tenders. 
                Please upload your documents in the Officer Profile section.
              </p>
              <button
                onClick={() => router.push("/officer/profile")}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
              >
                Complete KYC Now
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {currentUser?.kycStatus || "Pending"}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-300">KYC Verified</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your KYC is approved. You can now create tenders and manage procurement.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            if (!isKycApproved) {
              router.push("/officer/profile");
              return;
            }
            router.push("/officer/create-tender");
          }}
          disabled={!isKycApproved}
          className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
            isKycApproved 
              ? "border-teal-500/30 bg-teal-950/20 hover:bg-teal-950/30 hover:border-teal-500/50 cursor-pointer" 
              : "border-slate-700/50 bg-slate-900/50 opacity-60 cursor-not-allowed"
          }`}
        >
          <Plus className="w-8 h-8 text-teal-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Create New Tender</h3>
          <p className="text-xs text-slate-400 mt-1">Publish a new tender on blockchain</p>
          {!isKycApproved && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
              <AlertCircle className="w-3 h-3" />
              KYC required
            </div>
          )}
        </button>

        <button
          onClick={() => router.push("/officer/profile")}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 text-left hover:bg-card/60 transition-all"
        >
          <ShieldCheck className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">KYC & Profile</h3>
          <p className="text-xs text-slate-400 mt-1">Manage your KYC documents and profile</p>
        </button>

        <button
          onClick={() => router.push("/tenders")}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 text-left hover:bg-card/60 transition-all"
        >
          <FileText className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">All Tenders</h3>
          <p className="text-xs text-slate-400 mt-1">View and manage all tenders</p>
        </button>
      </div>

      {/* Recent Tenders */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Your Recent Tenders</h2>
        {tenders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-10 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tenders created yet. Create your first tender to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.slice(0, 5).map((tender) => (
              <div
                key={tender.id}
                onClick={() => router.push(`/tenders/${tender.id}`)}
                className="rounded-2xl border border-border/60 bg-card/40 p-5 hover:bg-card/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200 truncate">{tender.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Budget: ₹{tender.budget?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      tender.status === "Open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                      tender.status === "Closed" ? "bg-slate-500/10 text-slate-400 border border-slate-500/30" :
                      tender.status === "UnderEvaluation" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                      tender.status === "Awarded" ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {tender.status}
                    </span>
                    {tender.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tender.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Bids: {tender.bidsCount || 0}</span>
                  <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}