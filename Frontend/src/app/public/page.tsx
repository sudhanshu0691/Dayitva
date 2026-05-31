"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Eye, FileSearch, Layers, AlertCircle, ArrowUpRight, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { BackButton } from "../../components/ui/BackButton";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import tenderService from "@/services/tenderService";

function PublicContent() {
  const router = useRouter();
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenderService.listTenders({ status: "Open" }).then(res => {
      setTenders((res.data || []).slice(0, 10));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <BackButton href="/" label="Back to Home" variant="text" />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-5 sm:p-7">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <Globe className="w-3.5 h-3.5" />
              Public Transparency Access
            </div>
            <h1 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              Public Tender View
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Browse live tenders and procurement records. No login required.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => router.push("/dashboard")}
                className="text-left rounded-2xl border border-border bg-card hover:border-teal-500/50 p-4 transition-all">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-black uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  Public Dashboard
                </div>
                <p className="text-sm text-muted-foreground mt-2">View live tenders, transparency reports, and procurement analytics.</p>
              </button>
              <button onClick={() => router.push("/register")}
                className="text-left rounded-2xl border border-border bg-card hover:border-emerald-500/50 p-4 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  Register Now
                </div>
                <p className="text-sm text-muted-foreground mt-2">Create an account to bid on tenders or publish new tenders.</p>
              </button>
            </div>
          </section>

          <aside className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-300" />
                Live Tenders
              </h2>
              {loading ? (
                <div className="mt-3 text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2 font-mono">Loading tenders...</p>
                </div>
              ) : (
                <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {tenders.map((tender: any) => (
                    <button key={tender.id} onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-teal-500/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-teal-300">{tender.id}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>{formatCurrency(tender.budget)}</span>
                          <ArrowUpRight className="w-3 h-3 text-teal-400" />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-foreground mt-1 line-clamp-1">{tender.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{tender.ministry}</div>
                    </button>
                  ))}
                  {tenders.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No open tenders available</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function PublicAccessPage() {
  return (
    <ErrorBoundary>
      <PublicContent />
    </ErrorBoundary>
  );
}