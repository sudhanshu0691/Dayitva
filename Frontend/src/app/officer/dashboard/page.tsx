"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, Plus, AlertCircle, ShieldCheck, CheckCircle2,
  XCircle, Clock, ExternalLink, FileText, BarChart3, 
  RefreshCw
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
    { label: "Total tenders", value: stats.total, color: "#002869" },
    { label: "Open", value: stats.open, color: "#056e00" },
    { label: "Closed/review", value: stats.closed, color: "#521a00" },
    { label: "Awarded", value: stats.awarded, color: "#002869" },
  ];

  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#002869] mx-auto mb-2" />
          <p className="text-body-sm text-muted-foreground">Loading officer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-foreground heading-font font-bold flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#002869]" />
            Officer dashboard
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage tenders, view bids, and oversee procurement operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-body-sm">
            <p className="font-semibold text-foreground">{currentUser?.name || "Officer"}</p>
            <p className="text-muted-foreground">{currentUser?.ministry || "Government department"}</p>
          </div>
          <div className="w-10 h-10 bg-[#002869]/10 border border-[#002869]/30 flex items-center justify-center rounded-lg">
            <Landmark className="w-5 h-5 text-[#002869]" />
          </div>
        </div>
      </div>

      {/* Stats Grid with left border accents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <p className="text-headline-md font-bold text-foreground" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-label-sm text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* KYC Banner */}
      <div className="border border-border bg-white rounded-lg p-5">
        {!isKycApproved ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#521a00] mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-body-sm font-semibold text-[#521a00]">KYC verification required</h3>
              <p className="text-label-sm text-muted-foreground mt-1">
                You must complete KYC verification before you can create tenders.
              </p>
              <button onClick={() => router.push("/officer/profile")}
                className="mt-3 px-4 py-2.5 bg-[#521a00] text-white text-label-sm border border-[#521a00] hover:bg-[#762900] rounded-lg transition-colors font-semibold min-h-[44px]">
                Complete KYC now
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#521a00]/50 bg-[#fff3e6] text-[#521a00] text-label-sm font-semibold rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {currentUser?.kycStatus || "Pending"}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#056e00] mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-body-sm font-semibold text-[#056e00]">KYC verified</h3>
              <p className="text-label-sm text-muted-foreground mt-1">
                Your KYC is approved. You can now create tenders.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#056e00]/50 bg-[#e6f7e6] text-[#056e00] text-label-sm font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => isKycApproved ? router.push("/officer/create-tender") : router.push("/officer/profile")}
          className={`border p-5 text-left rounded-lg transition-all ${
            isKycApproved ? "border-[#002869]/50 bg-[#002869]/5 hover:bg-[#002869]/10 hover:shadow-hover" : "border-border bg-muted/30 opacity-60 cursor-not-allowed"
          }`}>
          <Plus className="w-8 h-8 text-[#002869] mb-3" />
          <h3 className="text-body-sm font-semibold text-foreground">Create new tender</h3>
          <p className="text-label-sm text-muted-foreground mt-1">Publish a new tender on blockchain</p>
          {!isKycApproved && (
            <div className="mt-2 flex items-center gap-1 text-label-sm text-[#521a00]">
              <AlertCircle className="w-3 h-3" />
              KYC required
            </div>
          )}
        </button>

        <button onClick={() => router.push("/officer/profile")}
          className="border border-border bg-white p-5 text-left rounded-lg hover:bg-surface-container-low hover:shadow-hover transition-all">
          <ShieldCheck className="w-8 h-8 text-[#002869] mb-3" />
          <h3 className="text-body-sm font-semibold text-foreground">KYC and profile</h3>
          <p className="text-label-sm text-muted-foreground mt-1">Manage your KYC documents and profile</p>
        </button>

        <button onClick={() => router.push("/tenders")}
          className="border border-border bg-white p-5 text-left rounded-lg hover:bg-surface-container-low hover:shadow-hover transition-all">
          <FileText className="w-8 h-8 text-[#002869] mb-3" />
          <h3 className="text-body-sm font-semibold text-foreground">All tenders</h3>
          <p className="text-label-sm text-muted-foreground mt-1">View and manage all tenders</p>
        </button>
      </div>

      {/* Recent Tenders */}
      <div>
        <h2 className="text-headline-md text-foreground heading-font font-bold mb-4">Your recent tenders</h2>
        {tenders.length === 0 ? (
          <div className="border border-dashed border-border/40 bg-white/20 p-10 text-center rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm text-muted-foreground">No tenders created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.slice(0, 5).map((tender) => (
              <div key={tender.id} onClick={() => router.push(`/tenders/${tender.id}`)}
                className="border border-border bg-white rounded-lg p-5 hover:bg-surface-container-low hover:shadow-hover transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-sm font-semibold text-foreground truncate">{tender.title}</h3>
                    <p className="text-label-sm text-muted-foreground mt-1">Budget: ₹{tender.budget?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-label-sm font-semibold ${
                      tender.status === "Open" ? "status-open" :
                      tender.status === "Closed" ? "status-closed" :
                      tender.status === "UnderEvaluation" ? "status-pending" :
                      tender.status === "Awarded" ? "status-approved" :
                      "status-pending"
                    }`}>
                      {tender.status === "UnderEvaluation" ? "Under Evaluation" : tender.status}
                    </span>
                    {tender.txHash && (
                      <a href={`https://sepolia.etherscan.io/tx/${tender.txHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#002869] hover:text-[#002869]/80"
                        onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-label-sm text-muted-foreground">
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