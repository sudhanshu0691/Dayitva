"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Ban, Search, Trash2, AlertTriangle, ShieldCheck,
  ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, UserX, Building
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import auditorService from "@/services/auditorService";

function BlacklistPageContent() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBlacklist();
  }, [page]);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getBlacklist(page, 20, search || undefined);
      setEntries(data.entries || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch blacklist", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRemove = async (entryId: string) => {
    if (!confirm("Are you sure you want to remove this entry from the blacklist?")) return;
    try {
      await auditorService.removeFromBlacklist(entryId);
      setSuccessMsg("Entry removed from blacklist successfully");
      fetchBlacklist();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to remove from blacklist", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/auditor/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Ban className="w-6 h-6 text-purple-400" />
              Blacklist Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage fraud vendors, fake officers, and suspicious accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-mono text-purple-400 font-bold">{entries.length} entries</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 text-sm text-emerald-400 font-mono rounded-2xl">{successMsg}</div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by name, email, company, reason..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
          className="max-w-md"
        />
        <Button type="submit" variant="outline" size="sm"><Search className="w-4 h-4" /></Button>
        <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>Clear</Button>
      </form>

      {/* Entries list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card/30 p-5">
              <div className="h-4 bg-slate-700/50 rounded w-48 mb-2"></div>
              <div className="h-3 bg-slate-700/50 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-12 text-center">
          <Ban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No blacklisted entries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="rounded-2xl border border-border/60 bg-card/40 p-5 hover:bg-card/60 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {entry.user?.companyName || entry.user?.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      entry.user?.role === "vendor" 
                        ? "text-teal-400 bg-teal-950/20 border-teal-800/30" 
                        : "text-blue-400 bg-blue-950/20 border-blue-800/30"
                    }`}>
                      {entry.userType?.toUpperCase() || entry.user?.role?.toUpperCase()}
                    </span>
                    {entry.removedAt ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-800/30">REMOVED</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-800/30">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{entry.user?.email}</p>
                  {entry.user?.pan && <p className="text-[10px] font-mono text-muted-foreground mt-0.5">PAN: {entry.user.pan}</p>}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  <div className="max-w-[200px] truncate" title={entry.reason}>{entry.reason}</div>
                  <div className="mt-1">By: {entry.addedBy?.fullName}</div>
                  <div className="mt-1">{new Date(entry.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!entry.removedAt && (
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="p-2 bg-emerald-950/20 rounded-xl hover:bg-emerald-950/40 transition-colors border border-emerald-800/20"
                      title="Remove from Blacklist"
                    >
                      <Trash2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BlacklistPage() {
  return (
    <ErrorBoundary>
      <BlacklistPageContent />
    </ErrorBoundary>
  );
}