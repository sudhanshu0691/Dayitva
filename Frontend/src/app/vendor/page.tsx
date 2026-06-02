"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, ShieldCheck, TrendingUp, Award, Eye, AlertCircle, 
  Send, RefreshCw, Lock, CheckCircle2, ExternalLink, AlertTriangle
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import tenderService from "@/services/tenderService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function VendorDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [submittingBid, setSubmittingBid] = useState<Record<string, boolean>>({});
  const [bidSuccess, setBidSuccess] = useState<Record<string, any>>({});
  const [expandedBid, setExpandedBid] = useState<string | null>(null);

  const isKycApproved = currentUser?.kycStatus === "Approved";

  useEffect(() => {
    if (!hydrated) return;
    const fetchData = async () => {
      try {
        const response = await tenderService.listTenders();
        setTenders(response.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hydrated]);

  const handleBidSubmit = async (tenderId: string) => {
    const amount = bidAmounts[tenderId];
    if (!amount || isNaN(parseFloat(amount))) return;

    if (!isKycApproved) {
      setError("Your KYC must be approved before submitting bids.");
      return;
    }

    setSubmittingBid(prev => ({ ...prev, [tenderId]: true }));
    setError(null);

    try {
      const result = await tenderService.submitSimpleBid(tenderId, {
        price: parseFloat(amount) * 10000000,
      });
      setBidSuccess(prev => ({ 
        ...prev, 
        [tenderId]: { 
          message: "Bid submitted successfully! Transaction recorded on blockchain.",
          txHash: result?.txHash || "0x...",
        }
      }));
      setBidAmounts(prev => ({ ...prev, [tenderId]: "" }));
      // Refresh tenders
      const response = await tenderService.listTenders();
      setTenders(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit bid");
    } finally {
      setSubmittingBid(prev => ({ ...prev, [tenderId]: false }));
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Vendor credentials required.</p>
        <button onClick={() => router.push("/auth/vendor")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Go to Vendor Login</button>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const openTenders = tenders.filter((t: any) => t.status === "Open");

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-teal-950 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider font-mono">Vendor Workspace</span>
            <h1 className="text-lg font-black mt-0.5">{currentUser.companyName || currentUser.name}</h1>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">{currentUser.email}</span>
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
                  ? "Your identity has been verified. You can place bids on open tenders."
                  : `Current KYC Status: ${currentUser.kycStatus || "Pending"}. Complete KYC to place bids.`
                }
              </p>
            </div>
          </div>
          {!isKycApproved && (
            <button
              onClick={() => router.push("/vendor/profile")}
              className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              Complete KYC Now
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-white">
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Available Tenders</span>
          <span className="block text-xl font-black font-mono mt-1">{tenders.length}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Open</span>
          <span className="block text-xl font-black font-mono mt-1 text-teal-400">{openTenders.length}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Won</span>
          <span className="block text-xl font-black font-mono mt-1 text-emerald-400">
            {tenders.filter((t: any) => t.winnerName === currentUser.companyName).length}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">KYC</span>
          <span className={`block text-xl font-black font-mono mt-1 ${isKycApproved ? "text-emerald-400" : "text-amber-400"}`}>
            {currentUser.kycStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Open Tenders with inline bidding */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-foreground">Open Tenders for Bidding</h3>
        {!isKycApproved && (
          <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono bg-amber-950/20 border border-amber-800/30 px-3 py-1.5 rounded-lg">
            <Lock className="w-3 h-3" />
            <span>KYC Pending — Bidding Locked</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {openTenders.map((tender: any) => {
          const isSubmitting = submittingBid[tender.id];
          const success = bidSuccess[tender.id];

          return (
            <div key={tender.id} className="p-5 rounded-2xl border border-border/80 bg-card hover:border-teal-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-teal-500">{tender.id}</span>
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono">Open</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">{tender.title}</h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">{tender.ministry}</p>
              <div className="grid grid-cols-3 gap-2 my-3 text-[10px] font-mono bg-muted/20 p-3 rounded-lg">
                <div><span className="block text-muted-foreground">Budget</span><strong className="text-foreground">{formatCurrency(tender.budget)}</strong></div>
                <div><span className="block text-muted-foreground">Deadline</span><strong className="text-foreground">{new Date(tender.deadline).toLocaleDateString()}</strong></div>
                <div><span className="block text-muted-foreground">Bids</span><strong className="text-teal-400">{tender.bidsCount || 0}</strong></div>
              </div>

              {/* Inline bidding form */}
              {isKycApproved && !success && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                        Your Bid (₹ in Crores)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 12.50"
                        value={bidAmounts[tender.id] || ""}
                        onChange={(e) => setBidAmounts(prev => ({ ...prev, [tender.id]: e.target.value }))}
                        disabled={isSubmitting}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => router.push(`/tenders/${tender.id}`)}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Details</span>
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
                        disabled={isSubmitting || !bidAmounts[tender.id]}
                        onClick={() => handleBidSubmit(tender.id)}
                      >
                        {isSubmitting ? (
                          <><RefreshCw className="w-3 h-3 animate-spin mr-1" />Submitting...</>
                        ) : (
                          <><Send className="w-3 h-3 mr-1" />Place Bid</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-300">Bid Submitted ✓</p>
                      <p className="text-emerald-400/70 font-mono mt-0.5">
                        Transaction: {success.txHash?.substring(0, 16)}...{success.txHash?.substring(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Locked state */}
              {!isKycApproved && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="p-2.5 bg-amber-950/10 border border-amber-800/20 rounded-lg text-[10px] text-amber-400 font-mono text-center">
                    <Lock className="w-3 h-3 inline mr-1" />
                    KYC must be approved to bid.{" "}
                    <button onClick={() => router.push("/vendor/profile")} className="underline hover:text-amber-300">Update KYC</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {openTenders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Building className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No open tenders available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}