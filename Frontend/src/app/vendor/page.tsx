"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building, ShieldCheck, TrendingUp, Award, Eye, AlertCircle, ArrowUpRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import tenderService from "@/services/tenderService";

export default function VendorDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if hydrated and user is authenticated
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

  // Wait for hydration to complete
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check authentication and role
  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Vendor credentials required.</p>
        <button onClick={() => router.push("/login/vendor")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Go to Vendor Login</button>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

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
          <span className="block text-xl font-black font-mono mt-1 text-teal-400">
            {tenders.filter((t: any) => t.status === "Open").length}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Won</span>
          <span className="block text-xl font-black font-mono mt-1 text-emerald-400">
            {tenders.filter((t: any) => t.winnerName === currentUser.companyName).length}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">KYC</span>
          <span className={`block text-xl font-black font-mono mt-1 ${currentUser.kycStatus === "Approved" ? "text-emerald-400" : "text-amber-400"}`}>
            {currentUser.kycStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Open Tenders */}
      <h3 className="text-sm font-black text-foreground mb-4">Open Tenders for Bidding</h3>
      <div className="space-y-4">
        {tenders.filter((t: any) => t.status === "Open").map((tender: any) => (
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
            <button onClick={() => router.push(`/tenders/${tender.id}`)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 border border-border rounded-xl hover:bg-muted">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>View & Bid</span>
            </button>
          </div>
        ))}
        {tenders.filter((t: any) => t.status === "Open").length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No open tenders available at the moment.</div>
        )}
      </div>
    </div>
  );
}