"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Ban, Search, Trash2, AlertTriangle, ShieldCheck,
  ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, UserX
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
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
      fetchBlacklist();
    } catch (err) {
      console.error("Failed to remove from blacklist", err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/auditor/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">Blacklist Management</h1>
              <p className="text-xs text-muted-foreground">Manage fraud vendors, fake officers, and suspicious accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 font-bold">{entries.length} entries</span>
          </div>
        </div>

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

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading blacklist...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ban className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No blacklisted entries</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">User</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Type</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Reason</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Added By</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Date</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Status</th>
                      <th className="text-right p-3 font-mono text-muted-foreground uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{entry.user?.companyName || entry.user?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.user?.email}</p>
                          {entry.user?.pan && <p className="text-[10px] font-mono text-muted-foreground">PAN: {entry.user.pan}</p>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${entry.user?.role === "vendor" ? "text-teal-400 bg-teal-950/20" : "text-blue-400 bg-blue-950/20"}`}>
                            {entry.userType?.toUpperCase() || entry.user?.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{entry.reason}</td>
                        <td className="p-3">
                          <p className="text-foreground">{entry.addedBy?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.addedBy?.officialEmail}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          {entry.removedAt ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/20">REMOVED</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-red-400 bg-red-950/20">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!entry.removedAt && (
                            <button
                              onClick={() => handleRemove(entry.id)}
                              className="p-1.5 bg-emerald-950/20 rounded hover:bg-emerald-950/40 transition-colors"
                              title="Remove from Blacklist"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

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