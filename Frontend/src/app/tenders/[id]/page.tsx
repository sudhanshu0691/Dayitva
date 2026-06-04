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
    return <div className="flex items-center justify-center min-h-screen"><div className="border-2 border-primary border-t-transparent w-6 h-6 animate-spin" /></div>;
  }

  if (error || !tender) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-[18px] font-500 text-foreground">Tender not found</h2>
        <p className="text-[13px] text-muted-foreground mt-2">{error || "The requested tender does not exist."}</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 px-4 py-2 bg-primary text-primary-foreground text-[13px] border border-primary hover:bg-primary/90">Back to dashboard</button>
      </div>
    );
  }

  const isDeadlinePassed = new Date(tender.deadline).getTime() < Date.now();
  const canBid = currentUser?.role === "vendor" && !isDeadlinePassed && kycStatus === "Approved";

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
    if (kycStatus !== "Approved") { setError("Your KYC must be approved before submitting bids."); return; }

    setSubmittingBid(true);
    try {
      await tenderService.submitSimpleBid(tender.id, { price: parseFloat(bidAmount) * 10000000 });
      setBidAmount("");
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
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      <button onClick={() => router.push(getBackUrl())}
        className="flex items-center space-x-1 text-[13px] text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-card border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="bg-muted border border-border text-primary text-[10px] px-2 py-0.5">Tender ID: {tender.id}</span>
              <span className={`text-[10px] px-2 py-0.5 ${getStatusBadge(tender.status)}`}>{tender.status}</span>
            </div>
            <h1 className="text-[18px] font-500 text-foreground leading-snug">{tender.title}</h1>
            <p className="text-[10px] text-primary tracking-wider mt-2 section-label">{tender.ministry}</p>
            <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed">{tender.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 border border-border text-center">
              <span className="block text-[10px] text-muted-foreground section-label">Budget</span>
              <span className="block font-500 text-[13px] text-foreground mt-1">{formatIndianCurrency(tender.budget)}</span>
            </div>
            <div className="p-4 bg-muted/30 border border-border text-center">
              <span className="block text-[10px] text-muted-foreground section-label">Deadline</span>
              <span className="block font-500 text-[13px] text-foreground mt-1">{new Date(tender.deadline).toLocaleDateString()}</span>
            </div>
            <div className="p-4 bg-muted/30 border border-border text-center">
              <span className="block text-[10px] text-muted-foreground section-label">MSME quota</span>
              <span className={`block font-500 text-[13px] mt-1 ${tender.msmeQuota ? "text-accent" : "text-muted-foreground"}`}>
                {tender.msmeQuota ? "YES" : "NO"}
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          {/* Bidding Section */}
          <div className="p-5 border border-border bg-card">
            <h3 className="section-label text-foreground flex items-center gap-1.5 pb-3 border-b border-border mb-4">
              <Lock className="w-4 h-4 text-primary" /> Bidding
            </h3>

            {currentUser?.role === "vendor" && !isDeadlinePassed ? (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="bg-muted/30 border border-border p-2.5 text-[11px] flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <div>
                    <span className="block text-muted-foreground">Bidding as:</span>
                    <span className="font-500 text-foreground">{currentUser.companyName || currentUser.name}</span>
                  </div>
                </div>
                <div className={`p-3 border text-[11px] ${kycStatus === "Approved" ? "border-status-approved bg-status-approved-bg text-status-approved" : "border-status-pending bg-status-pending-bg text-status-pending"}`}>
                  {kycLoading ? "Checking KYC status..." : kycStatus === "Approved" ? "KYC approved. You can submit bids." : `KYC status: ${kycStatus || "Pending"}. Bidding is locked until approval.`}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] section-label text-muted-foreground block">Your bid (in crores INR)</label>
                  <input type="number" step="0.01" placeholder="e.g. 1210.50" value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-background border border-input text-foreground pl-3 pr-12 py-2 text-[13px] focus:outline-none focus:border-primary"
                    disabled={submittingBid} />
                </div>
                <button type="submit" disabled={submittingBid || !canBid}
                  className="w-full flex items-center justify-center space-x-2 text-[13px] text-primary-foreground bg-primary border border-primary py-2.5 hover:bg-primary/90 transition-colors">
                  {submittingBid ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Submitting...</span></>
                    : <><Send className="w-4 h-4" /><span>Submit sealed bid</span></>}
                </button>
                {!canBid && !kycLoading && (
                  <button type="button" onClick={() => router.push("/vendor/profile")}
                    className="w-full flex items-center justify-center space-x-2 text-[13px] text-foreground bg-muted py-2.5 border border-border">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Go to KYC profile</span>
                  </button>
                )}
              </form>
            ) : (
              <div className="text-center py-6">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-[13px] text-muted-foreground">
                  {isDeadlinePassed ? "Bidding has concluded for this tender." :
                   currentUser?.role === "vendor" && kycStatus !== "Approved" ? "Your KYC must be approved before submitting bids." :
                   "Please login as a vendor to submit a bid."}
                </p>
              </div>
            )}
          </div>

          {/* Bids Registry */}
          <div className="p-5 border border-border bg-card">
            <h3 className="section-label text-foreground flex items-center gap-1.5 pb-3 border-b border-border mb-4">
              <Database className="w-4 h-4 text-primary" /> Bids ({bids.length})
            </h3>
            {bids.length > 0 ? bids.map((bid: any) => (
              <div key={bid.id} className="text-[11px] leading-relaxed border-b border-border pb-3 mb-3 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-500 text-foreground">{bid.vendorName}</span>
                </div>
                <div className="text-[13px] font-500 text-primary mt-1">{formatIndianCurrency(bid.price)}</div>
              </div>
            )) : (
              <div className="text-center py-6 text-[13px] text-muted-foreground">No bids yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}