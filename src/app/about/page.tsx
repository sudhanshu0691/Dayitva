"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Cpu, Layers, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { BackButton } from "../../components/ui/BackButton";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

function AboutContent() {
  const router = useRouter();
  const { language } = useApp();

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <nav aria-label="Breadcrumb">
        <BackButton href="/dashboard" label="Back to Dashboard" variant="text" />
      </nav>

      {/* Page Header */}
      <header className="text-center space-y-3">
        <span className="text-[10px] text-teal-400 font-bold font-mono tracking-widest uppercase bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
          Digital Governance Infrastructure
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
          How Blockchain Powers Procurement Transparency
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          TenderChain establishes decentralized trust, cryptographically sealed commercial bids, and automated L1 contract awards.
        </p>
      </header>

      {/* Main Core Features grids */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <article className="p-5 border border-border bg-card rounded-2xl shadow-sm space-y-3 transition-all duration-200 hover:border-teal-500/30">
          <div className="w-10 h-10 bg-teal-950 border border-teal-800/40 rounded-xl flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <h2 className="font-extrabold text-sm text-foreground">SHA-256 Bid Sealing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All submitted vendor pricing is sealed utilizing salted SHA-256 state roots. Bid amounts are cryptographically hidden from procurement officers until block timestamp expiry.
          </p>
        </article>

        <article className="p-5 border border-border bg-card rounded-2xl shadow-sm space-y-3 transition-all duration-200 hover:border-indigo-500/30">
          <div className="w-10 h-10 bg-indigo-950 border border-indigo-800/40 rounded-xl flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-extrabold text-sm text-foreground">Zero-Knowledge Evidence</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vendors provide mathematical evidence regarding prequalification thresholds without revealing private corporate transaction balances.
          </p>
        </article>

        <article className="p-5 border border-border bg-card rounded-2xl shadow-sm space-y-3 sm:col-span-2 md:col-span-1 transition-all duration-200 hover:border-orange-500/30">
          <div className="w-10 h-10 bg-orange-950 border border-orange-800/40 rounded-xl flex items-center justify-center text-[#FF9933]">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-extrabold text-sm text-foreground">Decentralized IPFS specs</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All technical guidelines and tender drawings are pinned to distributed IPFS storage hubs, guaranteeing that posted criteria cannot be altered post-facto.
          </p>
        </article>
      </section>

      {/* Interactive CTA Banner */}
      <section className="p-6 rounded-2xl border border-slate-800 bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-sm text-slate-100">Explore on-chain procurement</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-normal max-w-md">No authentication required. Browse and audit live contract ledgers directly in the public console.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-slate-950 font-black text-xs font-mono rounded-xl hover:scale-105 transition-transform flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Open Public Console"
        >
          <span>Open Public Console</span>
          <ArrowRight className="w-4 h-4 text-slate-950" aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <AboutContent />
    </ErrorBoundary>
  );
}