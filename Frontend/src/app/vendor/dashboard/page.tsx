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

  // Real-time tender updates via Socket.IO
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

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building className="w-6 h-6 text-teal-400" />
            Vendor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse live tenders and submit bids
          </p>
        </div>
      </div>

      {/* KYC Status Banner */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
        {!isKycApproved ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-300">KYC Verification Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                You must complete KYC verification before you can place bids on tenders.
                Please upload your documents in the Company Profile section.
              </p>
              <button
                onClick={() => router.push("/vendor/profile")}
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
                Your KYC is approved. You can now place bids on open tenders.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Live Tenders */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Live Tenders</h2>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card/30 p-5">
                <div className="h-4 bg-slate-700/50 rounded w-48 mb-2"></div>
                <div className="h-3 bg-slate-700/50 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-10 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tenders available yet. Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                onClick={() => router.push(`/tenders/${tender.id}`)}
                className="rounded-2xl border border-border/60 bg-card/40 p-5 hover:bg-card/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-200">{tender.title}</h3>
                      {tender.isNew && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Ministry: {tender.ministry || "N/A"} | Budget: ₹{tender.budget?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      tender.status === "Open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                      tender.status === "Closed" ? "bg-slate-500/10 text-slate-400 border border-slate-500/30" :
                      tender.status === "Awarded" ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {tender.status}
                    </span>
                    <Eye className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Bids: {tender.bidsCount || 0}</span>
                  <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                  {tender.txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tender.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-teal-400 hover:text-teal-300"
                      onClick={(e) => e.stopPropagation()}
                    >
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