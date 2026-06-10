"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, AlertCircle, ArrowUpRight, CheckCircle2, 
  AlertTriangle, Search, Clock, Send, ShieldCheck
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";

export default function VendorMyBids() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hydrated || !currentUser?.id) return;
    const fetchBids = async () => {
      try {
        const response = await tenderService.getMyBids();
        setBids(response.data || []);
      } catch (err: any) {
        // Fallback: get all open tenders and check if vendor has bid
        setBids([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [hydrated, currentUser?.id]);

  if (!hydrated) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-headline-md font-bold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Vendor credentials required.</p>
        <button onClick={() => router.push("/login")} className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold">
          Go to Login
        </button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const isKycApproved = currentUser.kycStatus === "Approved";

  const filteredBids = search
    ? bids.filter((b: any) => b.tenderTitle?.toLowerCase().includes(search.toLowerCase()) || b.id?.toLowerCase().includes(search.toLowerCase()))
    : bids;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      
      <div className="mb-8">
        <h1 className="text-headline-sm font-semibold text-foreground">My Bids</h1>
        <p className="text-caption text-muted-foreground mt-1">Track all your submitted bids</p>
      </div>

      {/* KYC Banner */}
      {!isKycApproved && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-body-sm text-foreground">KYC must be approved to place new bids</span>
          </div>
          <button onClick={() => router.push("/vendor/profile")} className="text-caption text-warning font-semibold underline">Complete KYC</button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bids..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-body-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length > 0 ? filteredBids.map((bid: any) => (
          <div key={bid.id} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-accent" />
                <span className="text-caption font-semibold text-accent">{bid.tenderId?.substring(0, 8)}...</span>
              </div>
              <span className={`text-caption font-semibold px-2.5 py-0.5 rounded-full border ${
                bid.status === "Submitted" ? "bg-warning/10 text-warning border-warning/20" :
                bid.status === "Revealed" ? "bg-accent/10 text-accent border-accent/20" :
                bid.status === "Evaluated" ? "bg-success/10 text-success border-success/20" :
                "bg-muted text-muted-foreground border-border"
              }`}>{bid.status}</span>
            </div>
            <h3 className="text-body-sm font-semibold text-foreground mb-2">{bid.tenderTitle || "Tender Bid"}</h3>
            <div className="grid grid-cols-3 gap-3 mb-3 text-caption">
              <div>
                <span className="text-muted-foreground">Bid Amount</span>
                <strong className="block text-foreground">{bid.price ? formatCurrency(bid.price) : "N/A"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted</span>
                <strong className="block text-foreground">{new Date(bid.submittedAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <strong className="block text-accent">{bid.status}</strong>
              </div>
            </div>
            {bid.txHash && (
              <div className="flex items-center gap-1.5 text-caption text-muted-foreground font-mono">
                <ShieldCheck className="w-3 h-3 text-success" />
                <span>Tx: {bid.txHash.substring(0, 16)}...</span>
                <a href={`https://sepolia.etherscan.io/tx/${bid.txHash}`} target="_blank" rel="noopener noreferrer"
                  className="text-accent hover:underline ml-1">View</a>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => router.push(`/tenders/${bid.tenderId}`)}
                className="text-caption text-accent font-semibold flex items-center gap-1 hover:underline">
                View Tender Details <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )) : (
          <div className="p-12 text-center border border-dashed border-border/40 bg-card/20 rounded-xl">
            <Send className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-body-sm text-muted-foreground">No bids submitted yet.</p>
            {isKycApproved && (
              <button onClick={() => router.push("/vendor")}
                className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-caption font-semibold">
                Browse Open Tenders
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}