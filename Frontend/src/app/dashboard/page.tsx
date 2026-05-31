"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, SlidersHorizontal, Eye, Layers, ShieldCheck, 
  Info, AlertCircle, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import tenderService from "@/services/tenderService";

const DashboardContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, language } = useApp();

  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedStatus !== "All") params.status = selectedStatus;
        const response = await tenderService.listTenders(params);
        setTenders(response.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load tenders");
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, [searchQuery, selectedStatus]);

  const sortedTenders = [...tenders].sort((a: any, b: any) => {
    if (sortBy === "budget-desc") return b.budget - a.budget;
    if (sortBy === "budget-asc") return a.budget - b.budget;
    if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return "bg-emerald-950/80 text-emerald-400 border-emerald-500/30";
      case "UnderEvaluation": return "bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse";
      case "Closed": return "bg-slate-900 text-slate-400 border-slate-700";
      case "Awarded": return "bg-teal-950/80 text-teal-400 border-teal-500/30";
      default: return "bg-slate-900 text-slate-400 border-slate-700";
    }
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      <div className="border-b border-border/80 pb-6 mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          Public E-Procurement Dashboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Browse active tenders, sealed bidding progress, and procurement milestones.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input type="text" placeholder="Search by ID, title..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-input pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
          </div>
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-background border border-input rounded-lg p-2 text-xs font-bold">
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="UnderEvaluation">Under Evaluation</option>
          <option value="Closed">Closed</option>
          <option value="Awarded">Awarded</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="bg-background border border-input rounded-lg p-2 text-xs font-bold">
          <option value="default">Default Order</option>
          <option value="budget-desc">Budget: High to Low</option>
          <option value="budget-asc">Budget: Low to High</option>
          <option value="deadline">Deadline: Nearest</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className="text-xs text-muted-foreground font-mono mb-4 p-2 bg-muted/40 rounded-lg">
        Showing: <strong>{sortedTenders.length}</strong> procurement entries
      </div>

      <div className="space-y-4">
        {sortedTenders.length > 0 ? sortedTenders.map((tender: any) => (
          <div key={tender.id} className="p-5 rounded-2xl border border-border/80 bg-card hover:border-teal-500/30 transition-all shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold text-teal-500">{tender.id}</span>
              <span className={`text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(tender.status)}`}>
                {tender.status}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-foreground line-clamp-2">{tender.title}</h3>
            <p className="text-[10px] font-extrabold text-muted-foreground tracking-wider font-mono mt-1 uppercase">{tender.ministry}</p>
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{tender.description}</p>
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 my-4 text-[10px] font-mono bg-muted/20 px-3 rounded-lg">
              <div><span className="block text-muted-foreground">BUDGET</span><strong className="block text-foreground mt-0.5">{formatIndianCurrency(tender.budget)}</strong></div>
              <div><span className="block text-muted-foreground">DEADLINE</span><strong className="block text-foreground mt-0.5">{new Date(tender.deadline).toLocaleDateString()}</strong></div>
              <div><span className="block text-muted-foreground">BIDS</span><strong className="block text-teal-400 mt-0.5">{tender.bidsCount || 0}</strong></div>
            </div>
            <button onClick={() => router.push(`/tenders/${tender.id}`)}
              className="flex items-center space-x-1 text-xs font-bold px-3.5 py-1.5 border border-border rounded-xl hover:bg-muted transition-all">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>View Details</span>
            </button>
          </div>
        )) : (
          <div className="p-12 text-center bg-card border border-border/80 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tenders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}