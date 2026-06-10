"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, AlertCircle, ArrowUpRight, Plus, Lock,
  CheckCircle2, AlertTriangle, LayoutDashboard, Search
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";

export default function OfficerMyTenders() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hydrated || !currentUser?.id) return;
    const fetchTenders = async () => {
      try {
        let allTenders;
        try {
          allTenders = await tenderService.listTenders({ createdBy: currentUser.id });
        } catch {
          allTenders = await tenderService.listTenders();
          allTenders.data = (allTenders.data || []).filter((t: any) => t.officerId === currentUser.id);
        }
        setTenders(allTenders.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load tenders");
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, [hydrated, currentUser?.id]);

  if (!hydrated) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-headline-md font-bold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Officer credentials required.</p>
        <button onClick={() => router.push("/login")} className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold">
          Go to Login
        </button>
      </div>
    );
  }

  const isKycApproved = currentUser.kycStatus === "Approved";
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const filteredTenders = search 
    ? tenders.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) || t.id?.toLowerCase().includes(search.toLowerCase()))
    : tenders;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-headline-sm font-semibold text-foreground">My Tenders</h1>
            <p className="text-caption text-muted-foreground">{tenders.length} total tenders</p>
          </div>
        </div>
        <button
          onClick={() => isKycApproved ? router.push("/officer/create-tender") : router.push("/officer/profile")}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-caption font-semibold flex items-center gap-1.5"
        >
          {isKycApproved ? <><Plus className="w-4 h-4" /> Create Tender</> : <><Lock className="w-4 h-4" /> KYC Required</>}
        </button>
      </div>

      {/* KYC Banner */}
      {!isKycApproved && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-body-sm text-foreground">KYC must be approved to create new tenders</span>
          </div>
          <button onClick={() => router.push("/officer/profile")} className="text-caption text-warning font-semibold underline">Complete KYC</button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenders by title or ID..."
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

      {/* Tenders List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">ID</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Title</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Budget</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Bids</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Deadline</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Status</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenders.map((tender: any) => (
                <tr key={tender.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-3.5 text-caption font-mono font-semibold text-accent">{tender.id?.substring(0, 8)}...</td>
                  <td className="p-3.5 text-body-sm font-semibold text-foreground truncate max-w-xs">{tender.title}</td>
                  <td className="p-3.5 text-body-sm font-mono text-foreground">{formatCurrency(tender.budget)}</td>
                  <td className="p-3.5 text-body-sm text-foreground">{tender.bidsCount || 0}</td>
                  <td className="p-3.5 text-caption text-muted-foreground">{new Date(tender.deadline).toLocaleDateString()}</td>
                  <td className="p-3.5">
                    <span className={`text-caption font-semibold px-2.5 py-0.5 rounded-full border ${
                      tender.status === "Open" ? "bg-success/10 text-success border-success/20" :
                      tender.status === "UnderEvaluation" ? "bg-warning/10 text-warning border-warning/20" :
                      tender.status === "Awarded" ? "bg-accent/10 text-accent border-accent/20" :
                      tender.status === "Draft" ? "bg-muted text-muted-foreground border-border" :
                      "bg-muted text-muted-foreground border-border"
                    }`}>{tender.status}</span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="p-2 border border-border rounded-xl hover:bg-surface-container-low hover:border-accent/30 transition-all text-muted-foreground hover:text-accent">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTenders.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-body-sm text-muted-foreground">
                  {search ? "No tenders match your search." : "No tenders created yet."}
                  {isKycApproved && !search && (
                    <div className="mt-4">
                      <button onClick={() => router.push("/officer/create-tender")}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-caption font-semibold">
                        <Plus className="w-4 h-4 inline mr-1" /> Create your first tender
                      </button>
                    </div>
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}