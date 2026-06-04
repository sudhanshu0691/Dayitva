"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Eye, Layers, AlertCircle, User
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
        <div className="border-2 border-[#002869] border-t-transparent w-6 h-6 animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-container mx-auto px-4 md:px-6 py-10">
      {/* Page Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-headline-md text-foreground heading-font font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#002869]" />
          Public e-procurement dashboard
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Browse active tenders, sealed bidding progress, and procurement milestones.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] text-body-sm flex items-center gap-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input type="text" placeholder="Search by ID, title..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border text-foreground pl-9 pr-3 py-2.5 text-body-sm rounded-lg focus:outline-none focus:border-[#002869] focus:ring-2 focus:ring-[#002869]/15 transition-all min-h-[44px]" />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3.5" />
          </div>
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-border text-foreground p-2.5 text-body-sm rounded-lg min-h-[44px]">
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="UnderEvaluation">Under evaluation</option>
          <option value="Closed">Closed</option>
          <option value="Awarded">Awarded</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-border text-foreground p-2.5 text-body-sm rounded-lg min-h-[44px]">
          <option value="default">Default order</option>
          <option value="budget-desc">Budget: High to low</option>
          <option value="budget-asc">Budget: Low to high</option>
          <option value="deadline">Deadline: Nearest</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {/* Result count */}
      <div className="text-body-sm text-muted-foreground mb-4 p-3 bg-surface-container-low border border-border rounded-lg">
        Showing: <strong className="text-foreground">{sortedTenders.length}</strong> procurement entries
      </div>

      {/* Tender list */}
      <div className="space-y-3">
        {sortedTenders.length > 0 ? sortedTenders.map((tender: any) => (
          <div key={tender.id} className="p-5 border border-border bg-white rounded-lg hover:border-[#002869]/30 hover:shadow-hover transition-all">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-label-sm text-[#002869] font-semibold">{tender.id}</span>
              <span className={`text-label-sm font-semibold ${getStatusBadge(tender.status)}`}>
                {tender.status === "UnderEvaluation" ? "Under Evaluation" : tender.status}
              </span>
            </div>
            <h3 className="font-semibold text-body-md text-foreground line-clamp-2 heading-font">{tender.title}</h3>
            <p className="text-label-sm text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{tender.ministry}</p>
            <p className="text-body-sm text-muted-foreground mt-3 line-clamp-2">{tender.description}</p>
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border my-4 text-label-sm bg-surface-container-low px-3 rounded">
              <div><span className="block text-muted-foreground uppercase tracking-wider font-semibold">Budget</span>
                <span className="block text-foreground font-bold mt-0.5">{formatIndianCurrency(tender.budget)}</span></div>
              <div><span className="block text-muted-foreground uppercase tracking-wider font-semibold">Deadline</span>
                <span className="block text-foreground font-bold mt-0.5">{new Date(tender.deadline).toLocaleDateString()}</span></div>
              <div><span className="block text-muted-foreground uppercase tracking-wider font-semibold">Bids</span>
                <span className="block text-[#002869] font-bold mt-0.5">{tender.bidsCount || 0}</span></div>
            </div>
            <button onClick={() => router.push(`/tenders/${tender.id}`)}
              className="flex items-center gap-1.5 text-body-sm px-3 py-2 border border-border rounded-lg hover:bg-surface-container-low transition-colors font-semibold min-h-[44px]">
              <Eye className="w-4 h-4 text-[#002869]" />
              <span>View details</span>
            </button>
          </div>
        )) : (
          <div className="p-12 text-center bg-white border border-border rounded-lg">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm text-muted-foreground">No tenders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="border-2 border-[#002869] border-t-transparent w-6 h-6 animate-spin rounded-full" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}