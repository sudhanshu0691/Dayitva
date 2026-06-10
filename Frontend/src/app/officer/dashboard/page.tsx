"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, User, Mail, Plus, ChevronRight, 
  ArrowUpRight, AlertCircle, ShieldCheck, Lock,
  CheckCircle2, AlertTriangle, LayoutDashboard, TrendingUp
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";

export default function OfficerDashboard() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !currentUser?.id) return;
    
    const fetchData = async () => {
      try {
        const tenderRes = await tenderService.listTenders({ createdBy: currentUser.id });
        setTenders(tenderRes.data || []);
      } catch (err: any) {
        if (err?.response?.status === 400 || err?.response?.status === 404) {
          try {
            const allTenders = await tenderService.listTenders();
            setTenders((allTenders.data || []).filter((t: any) => t.officerId === currentUser.id));
          } catch {
            setTenders([]);
          }
        } else {
          setError(err?.message || "Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hydrated, currentUser?.id]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-headline-md font-bold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Government Officer credentials required.</p>
        <button onClick={() => router.push("/login")}
          className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold shadow-soft hover:shadow-soft-md transition-all">
          Go to Officer Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isKycApproved = currentUser.kycStatus === "Approved";
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-1" style={{ left: '-5%', top: '5%' }} />
        <div className="floating-shape floating-shape-2" style={{ right: '-3%', bottom: '10%' }} />
      </div>

      {/* Header */}
      <div className="bg-primary border border-primary-container text-primary-foreground rounded-2xl p-6 mb-8 relative z-10 shadow-depth-lg">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="text-caption text-accent font-semibold uppercase tracking-wider">OFFICER DESK</span>
              <h1 className="text-headline-sm font-bold mt-1">{currentUser.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-caption text-white/60">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{currentUser.email}</span>
                {currentUser.designation && (
                  <span className="flex items-center gap-1 text-white/40">• {currentUser.designation} {currentUser.ministry ? `• ${currentUser.ministry}` : ""}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold border ${
              isKycApproved 
                ? "bg-success/20 border-success/30 text-success" 
                : "bg-warning/20 border-warning/30 text-warning"
            }`}>
              {isKycApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              KYC {isKycApproved ? "Verified" : currentUser.kycStatus || "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* KYC Banner */}
      {!isKycApproved && (
        <div className="mb-8 p-4 bg-warning/5 border border-warning/20 rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-warning shrink-0" />
              <div>
                <p className="font-semibold text-body-sm text-foreground">KYC Verification Required</p>
                <p className="text-caption text-muted-foreground mt-0.5">
                  Current KYC Status: {currentUser.kycStatus || "Pending"}. Complete KYC to create tenders.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/officer/profile")}
              className="px-4 py-2 bg-warning/10 border border-warning/30 text-warning rounded-xl text-caption font-semibold hover:bg-warning/20 transition-all"
            >
              Complete KYC Now
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="stat-card-3d border-l-[4px] border-l-accent p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-caption text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-4 h-4 text-accent" /> Total Tenders
          </div>
          <span className="text-headline-md font-bold text-foreground">{tenders.length}</span>
        </div>
        <div className="stat-card-3d border-l-[4px] border-l-success p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-caption text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-success" /> Active
          </div>
          <span className="text-headline-md font-bold text-success">
            {tenders.filter((t: any) => t.status === "Open" || t.status === "UnderEvaluation").length}
          </span>
        </div>
        <div className="stat-card-3d border-l-[4px] border-l-accent p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-caption text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            <Mail className="w-4 h-4 text-accent" /> Bids Received
          </div>
          <span className="text-headline-md font-bold text-foreground">
            {tenders.reduce((acc: number, t: any) => acc + (t.bidsCount || 0), 0)}
          </span>
        </div>
        <div className="stat-card-3d border-l-[4px] border-l-primary p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-caption text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> KYC Status
          </div>
          <span className={`text-headline-md font-bold ${isKycApproved ? "text-success" : "text-warning"}`}>
            {currentUser.kycStatus || "Pending"}
          </span>
        </div>
      </div>

      {/* Create Tender */}
      <div className="mb-8 relative z-10">
        <button
          onClick={() => isKycApproved && router.push("/officer/create-tender")}
          disabled={!isKycApproved}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-body-sm font-semibold transition-all ${
            isKycApproved
              ? "bg-accent text-accent-foreground shadow-soft-md hover:shadow-soft-lg hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
          }`}
        >
          {isKycApproved ? (
            <><Plus className="w-4 h-4" /> Create New Tender</>
          ) : (
            <><Lock className="w-4 h-4" /> KYC Required to Create Tender</>
          )}
        </button>
        {!isKycApproved && (
          <p className="text-caption text-warning text-center mt-2">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Your KYC must be approved by an Auditor before you can create tenders.
            <button onClick={() => router.push("/officer/profile")} className="underline ml-1 hover:text-warning/80 font-semibold">
              Go to Profile
            </button>
          </p>
        )}
      </div>

      {/* Tenders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden relative z-10">
        <div className="px-5 py-4 border-b border-border bg-surface-container-low flex items-center justify-between">
          <span className="text-caption font-semibold uppercase tracking-wider text-foreground">My Tenders</span>
          <span className="text-caption text-muted-foreground">{tenders.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">Bids</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-3.5 text-caption font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenders.map((tender: any) => (
                <tr key={tender.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-3.5 text-caption font-mono font-semibold text-accent">{tender.id?.substring(0,8)}...</td>
                  <td className="p-3.5 text-body-sm font-semibold text-foreground truncate max-w-xs">{tender.title}</td>
                  <td className="p-3.5 text-body-sm font-mono text-foreground">{formatCurrency(tender.budget)}</td>
                  <td className="p-3.5 text-body-sm text-foreground">{tender.bidsCount || 0}</td>
                  <td className="p-3.5">
                    <span className={`text-caption font-semibold px-2.5 py-0.5 rounded-full border ${
                      tender.status === "Open" ? "bg-success/10 text-success border-success/20" :
                      tender.status === "UnderEvaluation" ? "bg-warning/10 text-warning border-warning/20" :
                      tender.status === "Awarded" ? "bg-accent/10 text-accent border-accent/20" :
                      "bg-muted text-muted-foreground border-border"
                    }`}>
                      {tender.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="p-2 border border-border rounded-xl hover:bg-surface-container-low hover:border-accent/30 transition-all text-muted-foreground hover:text-accent">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tenders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-body-sm text-muted-foreground">No tenders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-card border border-border rounded-2xl p-6 relative z-10">
        <h3 className="text-caption text-accent font-semibold uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Landmark className="w-4 h-4" /> Quick Actions
        </h3>
        <div className="space-y-3">
          <button onClick={() => isKycApproved ? router.push("/officer/create-tender") : router.push("/officer/profile")}
            className="w-full flex items-center justify-between p-3.5 border border-border rounded-xl hover:border-accent/30 hover:bg-surface-container-low transition-all text-body-sm text-foreground font-semibold">
            <div className="flex items-center gap-3">
              {isKycApproved ? <Plus className="w-4 h-4 text-accent" /> : <ShieldCheck className="w-4 h-4 text-warning" />}
              <span>{isKycApproved ? "Create New Tender" : "Complete KYC Verification"}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => router.push("/officer/my-tenders")}
            className="w-full flex items-center justify-between p-3.5 border border-border rounded-xl hover:border-accent/30 hover:bg-surface-container-low transition-all text-body-sm text-foreground font-semibold">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>View All My Tenders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => router.push("/officer/profile")}
            className="w-full flex items-center justify-between p-3.5 border border-border rounded-xl hover:border-accent/30 hover:bg-surface-container-low transition-all text-body-sm text-foreground font-semibold">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-accent" />
              <span>View Profile & KYC Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}