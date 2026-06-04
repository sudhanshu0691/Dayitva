"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, Plus, AlertCircle, ShieldCheck, CheckCircle2,
  XCircle, Clock, ExternalLink, FileText
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import tenderService from "@/services/tenderService";

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

  const isKycApproved = currentUser?.kycStatus === "Approved";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return "status-approved";
      case "UnderEvaluation": return "status-pending";
      case "Closed": return "border border-muted-foreground text-muted-foreground bg-muted";
      case "Awarded": return "border border-primary text-primary bg-primary/10";
      default: return "border border-muted-foreground text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-foreground flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Officer desk
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage tenders, view bids, and oversee procurement
          </p>
        </div>
      </div>

      {/* KYC Banner */}
      <div className="border border-border bg-card p-5">
        {!isKycApproved ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-status-pending mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-[13px] font-medium text-status-pending">KYC verification required</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                You must complete KYC verification before you can create tenders.
              </p>
              <button onClick={() => router.push("/officer/profile")}
                className="mt-3 px-4 py-2 bg-accent text-primary-foreground text-[11px] border border-accent hover:bg-accent/90 transition-colors">
                Complete KYC now
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-status-pending bg-status-pending-bg text-status-pending text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              {currentUser?.kycStatus || "Pending"}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-status-approved mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-[13px] font-medium text-status-approved">KYC verified</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your KYC is approved. You can now create tenders.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-status-approved bg-status-approved-bg text-status-approved text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => isKycApproved ? router.push("/officer/create-tender") : router.push("/officer/profile")}
          className={`border p-5 text-left transition-colors ${
            isKycApproved ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "border-border bg-muted/30 opacity-60 cursor-not-allowed"
          }`}>
          <Plus className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-[13px] font-medium text-foreground">Create new tender</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Publish a new tender on blockchain</p>
          {!isKycApproved && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-status-pending">
              <AlertCircle className="w-3 h-3" />
              KYC required
            </div>
          )}
        </button>

        <button onClick={() => router.push("/officer/profile")}
          className="border border-border bg-card p-5 text-left hover:bg-muted transition-colors">
          <ShieldCheck className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-[13px] font-medium text-foreground">KYC and profile</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Manage your KYC documents and profile</p>
        </button>

        <button onClick={() => router.push("/tenders")}
          className="border border-border bg-card p-5 text-left hover:bg-muted transition-colors">
          <FileText className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-[13px] font-medium text-foreground">All tenders</h3>
          <p className="text-[11px] text-muted-foreground mt-1">View and manage all tenders</p>
        </button>
      </div>

      {/* Tenders List */}
      <div>
        <h2 className="text-[18px] font-medium text-foreground mb-4">Your tenders</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse border border-border bg-card/30 p-5">
                <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="border border-dashed border-border/40 bg-card/20 p-10 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No tenders created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.map((tender) => (
              <div key={tender.id} onClick={() => router.push(`/tenders/${tender.id}`)}
                className="border border-border bg-card p-5 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-medium text-foreground">{tender.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Budget: ₹{tender.budget?.toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] ${getStatusBadge(tender.status)}`}>
                    {tender.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  <span>Bids: {tender.bidsCount || 0}</span>
                  <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                  {tender.txHash && (
                    <a href={`https://sepolia.etherscan.io/tx/${tender.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3" />
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}