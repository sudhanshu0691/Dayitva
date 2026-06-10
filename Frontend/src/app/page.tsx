"use client";

import React, { useEffect, useState } from "react";
import { BlockchainMonitor } from "../components/BlockchainMonitor";
import { LiveNewsItem } from "../types";
import {
  Eye, ChevronRight,
  ShieldCheck, Calendar,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import tenderService from "@/services/tenderService";

export default function LandingPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<any[]>([]);
  const [news, setNews] = useState<LiveNewsItem[]>([]);

  useEffect(() => {
    tenderService.listTenders({ status: "Open" }).then(res => {
      setTenders(res.data || []);
    }).catch(() => {});

    fetch("/api/live-news")
      .then((res) => res.json())
      .then((data) => { setNews(data); })
      .catch(() => {});
  }, []);

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const activeTenders = tenders;

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="pt-24 pb-28 md:pt-32 md:pb-36 border-b border-border">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              National E-Procurement Stack
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Transparent procurement,{" "}
              <span className="text-accent">powered by blockchain</span>
            </h1>

            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              Dayitva secures India&apos;s public procurement on an immutable ledger.
              Tamper-proof tenders, full transparency, zero manipulation.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="default"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse tenders
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                size="lg"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-l border-r border-border">
            <div className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-foreground">{activeTenders.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Active tenders</div>
            </div>
            <div className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-foreground">1,842</div>
              <div className="text-sm text-muted-foreground mt-1">Verified nodes</div>
            </div>
            <div className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-success">0.00%</div>
              <div className="text-sm text-muted-foreground mt-1">Dispute rate</div>
            </div>
            <div className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-foreground">18,245</div>
              <div className="text-sm text-muted-foreground mt-1">Seals verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TENDERS */}
      <section className="py-20 md:py-24">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm text-accent font-semibold mb-1">Live listings</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Active procurement postings
              </h2>
              <p className="text-muted-foreground mt-2">
                Tenders verified on the blockchain ledger
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeTenders.slice(0, 4).map((tender: any) => (
              <div
                key={tender.id}
                className="border border-border rounded-xl bg-card hover:border-accent/30 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-muted-foreground font-mono font-semibold">{tender.id}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                      {tender.status === "Open" ? "Open" : tender.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-foreground line-clamp-2">{tender.title}</h3>
                  <p className="text-xs text-accent font-semibold uppercase tracking-wider mt-1.5">{tender.ministry}</p>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{tender.description}</p>
                </div>
                <div className="px-6 py-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-muted-foreground font-semibold">Budget</span>
                    <span className="block font-semibold text-sm text-foreground mt-0.5">{formatIndianCurrency(tender.budget)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground font-semibold">Deadline</span>
                    <span className="block font-semibold text-sm text-foreground mt-0.5">{new Date(tender.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-semibold">Verified on-chain</span>
                  </div>
                  <button
                    onClick={() => router.push(`/tenders/${tender.id}`)}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface-container-low hover:border-accent/30 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4 text-accent" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              View all tenders <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* NEWS & BLOCKCHAIN MONITOR */}
      <section className="pb-20 md:pb-24">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="mb-2">
                <p className="text-sm text-accent font-semibold">Updates</p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent" />
                Procurement news & reforms
              </h2>
              <p className="text-muted-foreground mt-2 mb-8">
                Updates from ministries and regulatory bodies
              </p>

              <div className="space-y-3">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border rounded-xl bg-card hover:border-accent/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-foreground leading-snug">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <BlockchainMonitor />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
