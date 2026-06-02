"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Download, Calendar, ShieldCheck, 
  Lock, Unlock, ArrowLeft, Building, User, Clock, Info, 
  Cpu, Award, ExternalLink, RefreshCw, Send, AlertTriangle, Database
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";
import userService from "@/services/userService";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, language } = useApp();
  const tenderId = params.id as string;

  const [tender, setTender] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenderData = await tenderService.getTenderById(tenderId);
        setTender(tenderData);
        setBids(tenderData?.bids || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load tender");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenderId]);

  useEffect(() => {
    const fetchKycStatus = async () => {
      if (currentUser?.role !== "vendor") return;

      setKycLoading(true);
      try {
        const statusResponse = await userService.getKYCStatus();
        setKycStatus(statusResponse?.kycStatus || currentUser.kycStatus || null);
      } catch {
        setKycStatus(currentUser.kycStatus || null);
      } finally {
        setKycLoading(false);
      }
    };

    fetchKycStatus();
  }, [currentUser]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (error || !tender) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Tender Not Found</h2>
        <p className="text-xs text-muted-foreground mt-2">{error || "The requested tender does not exist."}</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Back to Dashboard</button>
      </div>
    );
  }

  const isDeadlinePassed = new Date(tender.deadline).getTime() < Date.now();
  const canBid = currentUser?.role === "vendor" && !isDeadlinePassed && kycStatus === "Approved";

  // Determine back navigation based on user role
  const getBackUrl = () => {
    if (currentUser?.role === "officer") return "/officer/dashboard";
    if (currentUser?.role === "vendor") return "/vendor";
    return "/public/tenders";
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || isNaN(parseFloat(bidAmount))) return;

    if (kycStatus !== "Approved") {
      setError("Your KYC must be approved before submitting bids.");
      return;
    }

    setSubmittingBid(true);
    try {
      // Use simplified bid submission with auto-generated encrypted hash
      await tenderService.submitSimpleBid(tender.id, {
        price: parseFloat(bidAmount) * 10000000,
      });
      setBidAmount("");
      // Refresh tender details so the embedded bids list updates without hitting the officer-only endpoint
      const updatedTender = await tenderService.getTenderById(tender.id);
      setTender(updatedTender);
      setBids(updatedTender?.bids || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit bid");
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      <button onClick={() => router.push(getBackUrl())}
        className="flex items-center space-x-1 text-xs font-bold text-muted-foreground hover:text-teal-400 mb-6 font-mono">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="bg-slate-900 border border-slate-800 text-teal-400 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded">Tender ID: {tender.id}</span>
              <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                tender.status === "Open" ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/20" :
                tender.status === "UnderEvaluation" ? "bg-amber-950/80 text-amber-400 border-amber-500/20 animate-pulse" :
                tender.status === "Awarded" ? "bg-teal-950/80 text-teal-400 border-teal-500/20" :
                "bg-slate-900 text-slate-400 border-slate-700"
              }`}>{tender.status}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-foreground leading-snug">{tender.title}</h1>
            <p className="text-[10px] text-teal-400 font-bold tracking-wider mt-2 font-mono uppercase">{tender.ministry}</p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{tender.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-muted-foreground font-mono uppercase">Budget</span>
              <span className="block font-black text-sm text-foreground mt-1 font-mono">{formatIndianCurrency(tender.budget)}</span>
            </div>
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-muted-foreground font-mono uppercase">Deadline</span>
              <span className="block font-black text-sm text-foreground mt-1 font-mono">{new Date(tender.deadline).toLocaleDateString()}</span>
            </div>
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-muted-foreground font-mono uppercase">MSME Quota</span>
              <span className={`block font-black text-xs mt-1.5 font-mono ${tender.msmeQuota ? "text-orange-400" : "text-muted-foreground"}`}>
                {tender.msmeQuota ? "YES" : "NO"}
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-teal-400 border-b border-border/80 pb-3 mb-4">
              <Lock className="w-4 h-4" /> Bidding
            </h3>

            {currentUser?.role === "vendor" && !isDeadlinePassed ? (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="block text-slate-400">Bidding as:</span>
                    <span className="font-extrabold text-white">{currentUser.companyName || currentUser.name}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border text-[10px] font-mono ${kycStatus === "Approved" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300" : "bg-amber-950/30 border-amber-500/20 text-amber-300"}`}>
                  {kycLoading
                    ? "Checking KYC status..."
                    : kycStatus === "Approved"
                      ? "KYC approved. You can submit bids."
                      : `KYC status: ${kycStatus || "Pending"}. Bidding is locked until approval.`}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">Your Bid (in Crores INR)</label>
                  <input type="number" step="0.01" placeholder="e.g. 1210.50" value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-background border border-input pl-8 pr-12 py-2 rounded-lg text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={submittingBid} />
                </div>
                <button type="submit" disabled={submittingBid || !canBid}
                  className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 rounded-xl transition-all">
                  {submittingBid ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Submitting...</span></>
                    : <><Send className="w-4 h-4" /><span>Submit Sealed Bid</span></>}
                </button>
                {!canBid && !kycLoading && (
                  <button
                    type="button"
                    onClick={() => router.push("/vendor/profile")}
                    className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-foreground bg-muted py-2.5 rounded-xl border border-border"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Go to KYC Profile</span>
                  </button>
                )}
              </form>
            ) : (
              <div className="text-center py-6">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">
                  {isDeadlinePassed ? "Bidding has concluded for this tender." :
                   currentUser?.role === "vendor" && kycStatus !== "Approved" ? "Your KYC must be approved before submitting bids." :
                   "Please login as a vendor to submit a bid."}
                </p>
              </div>
            )}
          </div>

          {/* Bids Registry */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-foreground border-b border-border/80 pb-3 mb-4">
              <Database className="w-4 h-4 text-indigo-400" /> Bids ({bids.length})
            </h3>
            {bids.length > 0 ? bids.map((bid: any) => (
              <div key={bid.id} className="text-[10px] leading-relaxed border-b border-border/60 pb-3 mb-3 last:border-b-0">
                <div className="flex justify-between font-mono">
                  <span className="font-extrabold text-foreground">{bid.vendorName}</span>
                </div>
                <div className="text-xs font-extrabold text-teal-400 mt-1">{formatIndianCurrency(bid.price)}</div>
              </div>
            )) : (
              <div className="text-center py-6 text-xs text-muted-foreground">No bids yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}