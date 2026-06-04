"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Eye, FileSearch, Layers, AlertCircle, ArrowUpRight, UserPlus } from "lucide-react";
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <BackButton href="/" label="Back to home" variant="text" />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 border border-border bg-card p-5 sm:p-7">
            <div className="inline-flex items-center gap-2 text-[11px] section-label px-3 py-1.5 border border-primary/30 bg-primary/10 text-primary">
              <Globe className="w-3.5 h-3.5" />
              Public transparency access
            </div>
            <h1 className="mt-5 text-2xl sm:text-3xl font-medium leading-tight">
              Public tender view
            </h1>
            <p className="mt-4 text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
              Browse live tenders and procurement records. No login required.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => router.push("/dashboard")}
                className="text-left border border-border bg-card hover:border-primary/50 p-4 transition-colors">
                <div className="flex items-center gap-2 text-primary text-[11px] section-label">
                  <Layers className="w-4 h-4" />
                  Public dashboard
                </div>
                <p className="text-[13px] text-muted-foreground mt-2">View live tenders, transparency reports, and procurement analytics.</p>
              </button>
              <button onClick={() => router.push("/register")}
                className="text-left border border-border bg-card hover:border-primary/50 p-4 transition-colors">
                <div className="flex items-center gap-2 text-primary text-[11px] section-label">
                  <UserPlus className="w-4 h-4" />
                  Register now
                </div>
                <p className="text-[13px] text-muted-foreground mt-2">Create an account to bid on tenders or publish new tenders.</p>
              </button>
            </div>
          </section>

          <aside className="lg:col-span-5 space-y-5">
            <div className="border border-border bg-card p-5">
              <h2 className="text-[11px] section-label text-foreground flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-primary" />
                Live tenders
              </h2>
              {loading ? (
                <div className="mt-3 text-center py-8">
                  <div className="border-2 border-primary border-t-transparent w-5 h-5 animate-spin mx-auto" />
                  <p className="text-[13px] text-muted-foreground mt-2">Loading tenders...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {tenders.map((tender: any) => (
                    <button key={tender.id} onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="w-full text-left border border-border bg-card p-3 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-primary">{tender.id}</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>{formatCurrency(tender.budget)}</span>
                          <ArrowUpRight className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                      <div className="text-[13px] font-medium text-foreground mt-1 line-clamp-1">{tender.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{tender.ministry}</div>
                    </button>
                  ))}
                  {tenders.length === 0 && (
                    <p className="text-[13px] text-muted-foreground text-center py-4">No open tenders available</p>
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