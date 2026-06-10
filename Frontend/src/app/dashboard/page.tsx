"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Eye, Layers, AlertCircle, TrendingUp, ChevronRight
} from "lucide-react";
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
      case "Open": return "status-open";
      case "UnderEvaluation": return "status-pending";
      case "Closed": return "status-closed";
      case "Awarded": return "status-approved";
      default: return "status-closed";
    }
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-container mx-auto px-4 md:px-6 py-10 relative perspective">
      {/* 3D grid background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-2" style={{ right: '-5%', top: '10%' }} />
        <div className="floating-shape floating-shape-3" style={{ left: '-3%', bottom: '20%' }} />
      </div>

      <div className="border-b border-border pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
          <span className="text-caption text-accent font-semibold uppercase tracking-wider">Public dashboard</span>
        </div>
        <h1 className="text-headline-md text-foreground heading-font font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" />
          Public e-procurement dashboard
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Browse active tenders, sealed bidding progress, and procurement milestones.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <input type="text" placeholder="Search by ID, title..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border-2 border-input text-foreground pl-10 pr-3 py-2.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all min-h-[44px]" />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-card border-2 border-input text-foreground p-2.5 text-body-sm rounded-xl min-h-[44px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all">
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="UnderEvaluation">Under evaluation</option>
          <option value="Closed">Closed</option>
          <option value="Awarded">Awarded</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="bg-card border-2 border-input text-foreground p-2.5 text-body-sm rounded-xl min-h-[44px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all">
          <option value="default">Default order</option>
          <option value="budget-desc">Budget: High to low</option>
          <option value="budget-asc">Budget: Low to high</option>
          <option value="deadline">Deadline: Nearest</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      <div className="text-body-sm text-muted-foreground mb-5 p-3 bg-surface-container-low border border-border rounded-xl card-depth">
        Showing: <strong className="text-foreground">{sortedTenders.length}</strong> procurement entries
      </div>

      <div className="space-y-4 relative z-10">
        {sortedTenders.length > 0 ? sortedTenders.map((tender: any) => (
          <div key={tender.id} className="card-3d-tilt p-5 border border-border bg-card rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-caption text-accent font-semibold font-mono">{tender.id}</span>
              <span className={`text-caption font-semibold ${getStatusBadge(tender.status)}`}>
                {tender.status === "UnderEvaluation" ? "Under Evaluation" : tender.status}
              </span>
            </div>
            <h3 className="font-semibold text-title-md text-foreground line-clamp-2 heading-font">{tender.title}</h3>
            <p className="text-caption text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{tender.ministry}</p>
            <p className="text-body-sm text-muted-foreground mt-3 line-clamp-2">{tender.description}</p>
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-border my-4 bg-surface-container-low px-4 rounded-xl">
              <div>
                <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">Budget</span>
                <span className="block text-foreground font-bold mt-0.5 text-body-sm">{formatIndianCurrency(tender.budget)}</span>
              </div>
              <div>
                <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">Deadline</span>
                <span className="block text-foreground font-bold mt-0.5 text-body-sm">{new Date(tender.deadline).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-caption text-muted-foreground uppercase tracking-wider font-semibold">Bids</span>
                <span className="block text-accent font-bold mt-0.5 text-body-sm">{tender.bidsCount || 0}</span>
              </div>
            </div>
            <button onClick={() => router.push(`/tenders/${tender.id}`)}
              className="inline-flex items-center gap-1.5 text-body-sm px-4 py-2 border border-border rounded-xl hover:bg-surface-container-low hover:border-accent/30 transition-all font-semibold min-h-[40px]">
              <Eye className="w-4 h-4 text-accent" />
              <span>View details</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )) : (
          <div className="p-12 text-center bg-card border border-border rounded-xl">
            <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm text-muted-foreground">No tenders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
