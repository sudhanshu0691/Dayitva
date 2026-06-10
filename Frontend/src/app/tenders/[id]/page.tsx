"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Download, Calendar, ShieldCheck, 
  Lock, ArrowLeft, Building, Clock, Info, 
  Cpu, Award, ExternalLink, RefreshCw, Send, AlertTriangle, Database,
  CheckCircle2, XCircle
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";
import userService from "@/services/userService";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";

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
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (error || !tender) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
        </div>
        <h2 className="text-headline-sm font-semibold text-foreground">Tender not found</h2>
        <p className="text-body-sm text-muted-foreground mt-2">{error || "The requested tender does not exist."}</p>
        <button onClick={() => router.push("/dashboard")} 
          className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold shadow-soft hover:shadow-soft-md transition-all">
          Back to dashboard
        </button>
      </div>
    );
  }

  const isDeadlinePassed = new Date(tender.deadline).getTime() < Date.now();
  const canBid = currentUser?.role === "vendor" && !isDeadlinePassed && kycStatus === "Approved";

  const getBackUrl = () => {
    if (currentUser?.role === "officer") return "/officer/dashboard";
    if (currentUser?.role === "vendor") return "/vendor/dashboard";
    return "/tenders";
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
      case "Closed": return "status-closed";
      case "Awarded": return "border border-accent/30 text-accent bg-accent/10";
      default: return "status-closed";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      <button onClick={() => router.push(getBackUrl())}
        className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-accent mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="bg-surface-container-low border border-border text-caption text-muted-foreground px-2.5 py-0.5 rounded font-mono font-semibold">Tender ID: {tender.id}</span>
              <span className={`text-caption px-2.5 py-0.5 font-semibold ${getStatusBadge(tender.status)}`}>{tender.status}</span>
            </div>
            <h1 className="text-headline-sm font-semibold text-foreground leading-snug">{tender.title}</h1>
            <p className="text-caption text-accent tracking-wider mt-2 font-semibold uppercase">{tender.ministry}</p>
            <p className="text-body-sm text-muted-foreground mt-4 leading-relaxed">{tender.description}</p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-surface-container-low border border-border rounded-xl text-center">
              <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">Budget</span>
              <span className="block font-bold text-body-md text-foreground mt-1">{formatIndianCurrency(tender.budget)}</span>
            </div>
            <div className="p-5 bg-surface-container-low border border-border rounded-xl text-center">
              <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">Deadline</span>
              <span className="block font-bold text-body-md text-foreground mt-1">{new Date(tender.deadline).toLocaleDateString()}</span>
            </div>
            <div className="p-5 bg-surface-container-low border border-border rounded-xl text-center">
              <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">MSME quota</span>
              <span className={`block font-bold text-body-md mt-1 ${tender.msmeQuota ? "text-success" : "text-muted-foreground"}`}>
                {tender.msmeQuota ? "YES" : "NO"}
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          {/* Bidding Section */}
          <Card className="p-5">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-caption font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent" /> Bidding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              {currentUser?.role === "vendor" && !isDeadlinePassed ? (
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div className="bg-surface-container-low border border-border p-3 rounded-xl text-caption flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-accent" />
                    <div>
                      <span className="block text-muted-foreground">Bidding as:</span>
                      <span className="font-semibold text-foreground">{currentUser.companyName || currentUser.name}</span>
                    </div>
                  </div>
                  <div className={`p-3 border rounded-xl text-caption flex items-center gap-2 ${
                    kycStatus === "Approved" 
                      ? "bg-success/10 border-success/20 text-success" 
                      : "bg-warning/10 border-warning/20 text-warning"
                  }`}>
                    {kycLoading ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking KYC status...</>
                    ) : kycStatus === "Approved" ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> KYC approved. You can submit bids.</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> KYC: {kycStatus || "Pending"}. Bidding locked.</>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption font-semibold uppercase tracking-wider text-muted-foreground block">Your bid (in crores INR)</label>
                    <div className="relative">
                      <input type="number" step="0.01" placeholder="e.g. 1210.50" value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full h-11 bg-card border-2 border-input text-foreground pl-3.5 pr-12 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        disabled={submittingBid} />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground font-semibold">Cr</span>
                    </div>
                  </div>
                  <Button type="submit" variant="accent" className="w-full" disabled={submittingBid || !canBid} loading={submittingBid} loadingText="Submitting...">
                    <Send className="w-4 h-4" />
                    Submit sealed bid
                  </Button>
                  {!canBid && !kycLoading && (
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/vendor/profile")}>
                      <ShieldCheck className="w-4 h-4" />
                      Go to KYC profile
                    </Button>
                  )}
                </form>
              ) : (
                <div className="text-center py-6">
                  <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-body-sm text-muted-foreground">
                    {isDeadlinePassed ? "Bidding has concluded for this tender." :
                     currentUser?.role === "vendor" && kycStatus !== "Approved" ? "Your KYC must be approved before submitting bids." :
                     "Please login as a vendor to submit a bid."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bids Registry */}
          <Card className="p-5">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-caption font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-accent" /> Bids ({bids.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {bids.length > 0 ? bids.map((bid: any) => (
                <div key={bid.id} className="border-b border-border pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <span className="text-body-sm font-semibold text-foreground">{bid.vendorName}</span>
                  </div>
                  <div className="text-headline-sm font-bold text-accent mt-1">{formatIndianCurrency(bid.price)}</div>
                </div>
              )) : (
                <div className="text-center py-6 text-body-sm text-muted-foreground">No bids yet</div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
