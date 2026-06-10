"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, ShieldCheck, TrendingUp, Award, Eye, AlertCircle, 
  Send, RefreshCw, Lock, CheckCircle2, ExternalLink, AlertTriangle
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function VendorDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [submittingBid, setSubmittingBid] = useState<Record<string, boolean>>({});
  const [bidSuccess, setBidSuccess] = useState<Record<string, any>>({});

  const isKycApproved = currentUser?.kycStatus === "Approved";

  useEffect(() => {
    if (!hydrated) return;
    const fetchData = async () => {
      try {
        const response = await tenderService.listTenders({ status: "Open" });
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
      const response = await tenderService.listTenders({ status: "Open" });
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
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-headline-sm font-semibold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Vendor credentials required.</p>
        <Button onClick={() => router.push("/login")} className="mt-6">
          Go to Vendor Login
        </Button>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const openTenders = tenders.filter((t: any) => t.status === "Open");

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-2" style={{ right: '-5%', top: '5%' }} />
        <div className="floating-shape floating-shape-3" style={{ left: '-3%', bottom: '10%' }} />
      </div>

      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-primary to-primary/80 border border-border text-primary-foreground rounded-xl mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center text-accent-foreground">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-caption text-accent-foreground/80 font-semibold uppercase tracking-wider">Vendor Workspace</span>
            <h1 className="text-headline-sm font-semibold mt-0.5">{currentUser.companyName || currentUser.name}</h1>
            <span className="text-caption text-primary-foreground/60 mt-1 block">{currentUser.email}</span>
          </div>
        </div>
      </div>

      {/* KYC Status Banner */}
      <div className={`mb-8 p-4 rounded-xl border ${
        isKycApproved 
          ? "bg-success/10 border-success/20" 
          : "bg-warning/10 border-warning/20"
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {isKycApproved ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-warning" />
            )}
            <div>
              <p className="font-semibold text-body-sm text-foreground">
                {isKycApproved ? "KYC Verified" : "KYC Verification Required"}
              </p>
              <p className="text-label-sm text-muted-foreground mt-0.5">
                {isKycApproved 
                  ? "Your identity has been verified. You can place bids on open tenders."
                  : `Current KYC Status: ${currentUser.kycStatus || "Pending"}. Complete KYC to place bids.`
                }
              </p>
            </div>
          </div>
          {!isKycApproved && (
            <Button variant="outline" size="sm" onClick={() => router.push("/vendor/profile")}>
              Complete KYC Now
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="border-l-[4px] border-l-accent p-5 bg-card border border-border rounded-xl">
          <span className="text-caption text-muted-foreground font-semibold uppercase tracking-wider">Available Tenders</span>
          <span className="block text-headline-sm font-bold mt-1 text-foreground">{tenders.length}</span>
        </div>
        <div className="border-l-[4px] border-l-accent p-5 bg-card border border-border rounded-xl">
          <span className="text-caption text-muted-foreground font-semibold uppercase tracking-wider">Open</span>
          <span className="block text-headline-sm font-bold mt-1 text-accent">{openTenders.length}</span>
        </div>
        <div className="border-l-[4px] border-l-success p-5 bg-card border border-border rounded-xl">
          <span className="text-caption text-muted-foreground font-semibold uppercase tracking-wider">Won</span>
          <span className="block text-headline-sm font-bold mt-1 text-success">
            {tenders.filter((t: any) => t.winnerName === currentUser.companyName).length}
          </span>
        </div>
        <div className="border-l-[4px] border-l-primary p-5 bg-card border border-border rounded-xl">
          <span className="text-caption text-muted-foreground font-semibold uppercase tracking-wider">KYC</span>
          <span className={`block text-headline-sm font-bold mt-1 ${isKycApproved ? "text-success" : "text-warning"}`}>
            {currentUser.kycStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Open Tenders with inline bidding */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-sm font-semibold text-foreground">Open Tenders for Bidding</h3>
        {!isKycApproved && (
          <div className="flex items-center gap-2 text-caption text-warning font-semibold bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg">
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
            <div key={tender.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption font-semibold text-accent">{tender.id?.substring(0,8)}...</span>
                <span className="text-caption font-semibold px-2.5 py-0.5 rounded-full border bg-success/10 text-success border-success/20">Open</span>
              </div>
              <h3 className="text-body-sm font-semibold text-foreground">{tender.title}</h3>
              <p className="text-caption text-muted-foreground mt-1">{tender.ministry}</p>
              <div className="grid grid-cols-3 gap-2 my-3 text-caption bg-surface-container-low border border-border p-3 rounded-lg">
                <div><span className="block text-muted-foreground">Budget</span><strong className="text-foreground">{formatCurrency(tender.budget)}</strong></div>
                <div><span className="block text-muted-foreground">Deadline</span><strong className="text-foreground">{new Date(tender.deadline).toLocaleDateString()}</strong></div>
                <div><span className="block text-muted-foreground">Bids</span><strong className="text-accent">{tender.bidsCount || 0}</strong></div>
              </div>

              {/* Inline bidding form */}
              {isKycApproved && !success && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-caption text-muted-foreground font-semibold block mb-1">
                        Your Bid (₹ in Crores)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 12.50"
                        value={bidAmounts[tender.id] || ""}
                        onChange={(e) => setBidAmounts(prev => ({ ...prev, [tender.id]: e.target.value }))}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/tenders/${tender.id}`)}>
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Details</span>
                      </Button>
                      <Button variant="accent" size="sm" disabled={isSubmitting || !bidAmounts[tender.id]} onClick={() => handleBidSubmit(tender.id)}>
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
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <div className="text-body-sm">
                      <p className="font-semibold text-success">Bid Submitted</p>
                      <p className="text-label-sm text-success/80 font-mono mt-0.5">
                        Transaction: {success.txHash?.substring(0, 16)}...{success.txHash?.substring(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Locked state */}
              {!isKycApproved && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="p-2.5 bg-warning/10 border border-warning/20 rounded-lg text-caption text-warning text-center">
                    <Lock className="w-3 h-3 inline mr-1" />
                    KYC must be approved to bid.{" "}
                    <button onClick={() => router.push("/vendor/profile")} className="underline hover:text-warning/80">Update KYC</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {openTenders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground border border-dashed border-border/40 bg-card/20 rounded-xl">
            <Building className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-body-sm">No open tenders available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}