"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, CheckCircle2, AlertCircle, Clock, ExternalLink,
  FileText, Eye, ShieldCheck
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useSocket } from "../../../hooks/useSocket";
import tenderService from "@/services/tenderService";

export default function VendorDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  const socket = useSocket(currentUser?.id);
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKycApproved = currentUser?.kycStatus === "Approved";

  const fetchTenders = useCallback(async () => {
    try {
      const response = await tenderService.listTenders();
      setTenders(response.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    fetchTenders();
  }, [hydrated, fetchTenders]);

  useEffect(() => {
    const unsubTenderUpdate = socket.on("tender:updated", (data: any) => {
      setTenders(prev => {
        const idx = prev.findIndex(t => t.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [data, ...prev];
      });
    });

    const unsubTenderNew = socket.on("tender:published", (data: any) => {
      setTenders(prev => [data, ...prev]);
    });

    return () => {
      unsubTenderUpdate();
      unsubTenderNew();
    };
  }, [socket]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return "status-open";
      case "UnderEvaluation": return "status-pending";
      case "Closed": return "status-closed";
      case "Awarded": return "status-approved";
      default: return "status-closed";
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="border-2 border-[#002869] border-t-transparent w-6 h-6 animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-foreground heading-font font-bold flex items-center gap-2">
            <Building className="w-5 h-5 text-[#002869]" />
            Vendor dashboard
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Browse live tenders and submit bids
          </p>
        </div>
      </div>

      {/* KYC Banner */}
      <div className="border border-border bg-white rounded-lg p-5">
        {!isKycApproved ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#521a00] mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-body-sm font-semibold text-[#521a00]">KYC verification required</h3>
              <p className="text-label-sm text-muted-foreground mt-1">
                You must complete KYC verification before you can place bids.
              </p>
              <button onClick={() => router.push("/vendor/profile")}
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
                Your KYC is approved. You can now place bids on open tenders.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#056e00]/50 bg-[#e6f7e6] text-[#056e00] text-label-sm font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Live Tenders */}
      <div>
        <h2 className="text-headline-md text-foreground heading-font font-bold mb-4">Live tenders</h2>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse border border-border bg-white/30 rounded-lg p-5">
                <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="border border-dashed border-border/40 bg-white/20 p-10 text-center rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm text-muted-foreground">No tenders available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.map((tender) => (
              <div key={tender.id} onClick={() => router.push(`/tenders/${tender.id}`)}
                className="border border-border bg-white rounded-lg p-5 hover:bg-surface-container-low hover:shadow-hover transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-sm font-semibold text-foreground">{tender.title}</h3>
                      {tender.isNew && (
                        <span className="px-1.5 py-0.5 bg-[#002869]/20 text-[#002869] text-[10px] font-semibold rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-label-sm text-muted-foreground mt-1">
                      Ministry: {tender.ministry || "N/A"} | Budget: ₹{tender.budget?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-label-sm font-semibold ${getStatusBadge(tender.status)}`}>
                      {tender.status === "UnderEvaluation" ? "Under Evaluation" : tender.status}
                    </span>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-label-sm text-muted-foreground">
                  <span>Bids: {tender.bidsCount || 0}</span>
                  <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                  {tender.txHash && (
                    <a href={`https://sepolia.etherscan.io/tx/${tender.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#002869] hover:text-[#002869]/80 font-semibold"
                      onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3" />
                      Etherscan
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