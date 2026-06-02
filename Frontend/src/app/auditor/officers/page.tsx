"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, CheckCircle2, XCircle, Ban, AlertTriangle,
  RefreshCw, ShieldCheck, ChevronLeft, ChevronRight,
  Upload, Building, ArrowLeft
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import auditorService from "@/services/auditorService";

function OfficersPageContent() {
  const router = useRouter();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "blacklist" | "clarification" | "flag">("approve");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();
  }, [page]);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getOfficers(page, 20, search || undefined);
      setOfficers(data.officers || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch officers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openActionModal = (officer: any, type: "approve" | "reject" | "blacklist" | "clarification" | "flag") => {
    setSelectedOfficer(officer);
    setActionType(type);
    setRemarks("");
    setActionError(null);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedOfficer || !remarks.trim()) {
      setActionError("Remarks are required");
      return;
    }
    setActionLoading(true);
    setActionError(null);

    try {
      switch (actionType) {
        case "approve":
          await auditorService.approve(selectedOfficer.id, remarks, "officer");
          setSuccessMsg("Officer approved successfully");
          break;
        case "reject":
          await auditorService.reject(selectedOfficer.id, remarks, "officer");
          setSuccessMsg("Officer rejected");
          break;
        case "blacklist":
          await auditorService.blacklist(selectedOfficer.id, remarks, "officer");
          setSuccessMsg("Officer blacklisted");
          break;
        case "clarification":
          await auditorService.requestReUpload(selectedOfficer.id, remarks, "officer");
          setSuccessMsg("Clarification requested");
          break;
        case "flag":
          await auditorService.flagSuspicious(selectedOfficer.id, remarks, "officer");
          setSuccessMsg("Officer flagged as suspicious");
          break;
      }
      setShowActionModal(false);
      fetchOfficers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-emerald-400 bg-emerald-950/20 border-emerald-800/30";
      case "Rejected": return "text-red-400 bg-red-950/20 border-red-800/30";
      case "Pending": return "text-yellow-400 bg-yellow-950/20 border-yellow-800/30";
      case "Blacklisted": return "text-purple-400 bg-purple-950/20 border-purple-800/30";
      case "Suspicious": return "text-orange-400 bg-orange-950/20 border-orange-800/30";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const actionLabels = {
    approve: { title: "Approve Officer", color: "text-emerald-400", btnColor: "bg-emerald-700 hover:bg-emerald-800", icon: CheckCircle2 },
    reject: { title: "Reject Officer", color: "text-red-400", btnColor: "bg-red-700 hover:bg-red-800", icon: XCircle },
    blacklist: { title: "Blacklist Officer", color: "text-purple-400", btnColor: "bg-purple-700 hover:bg-purple-800", icon: Ban },
    clarification: { title: "Request Clarification", color: "text-yellow-400", btnColor: "bg-yellow-700 hover:bg-yellow-800", icon: Upload },
    flag: { title: "Flag Suspicious Activity", color: "text-orange-400", btnColor: "bg-orange-700 hover:bg-orange-800", icon: AlertTriangle },
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
              <Users className="w-6 h-6 text-blue-400" />
              Officer Verification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and verify government officer accounts
            </p>
          </div>
        </div>
        <ShieldCheck className="w-6 h-6 text-red-400" />
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 text-sm text-emerald-400 font-mono rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by Email, Name, Department..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
          className="max-w-md"
        />
        <Button type="submit" variant="outline" size="sm"><Search className="w-4 h-4" /></Button>
        <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>Clear</Button>
      </form>

      {/* Officers list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card/30 p-5">
              <div className="h-4 bg-slate-700/50 rounded w-48 mb-2"></div>
              <div className="h-3 bg-slate-700/50 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : officers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No officers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {officers.map((officer) => (
            <div
              key={officer.id}
              className="rounded-2xl border border-border/60 bg-card/40 p-5 hover:bg-card/60 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{officer.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusColor(officer.kycStatus)}`}>
                      {officer.kycStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{officer.email}</p>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-muted-foreground" />
                    <span>{officer.ministry || "N/A"}</span>
                  </div>
                  <div className="mt-1">{officer.designation || "N/A"}</div>
                  <div className="mt-1">{new Date(officer.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openActionModal(officer, "approve")} className="p-2 bg-emerald-950/20 rounded-xl hover:bg-emerald-950/40 transition-colors border border-emerald-800/20" title="Approve">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button onClick={() => openActionModal(officer, "reject")} className="p-2 bg-red-950/20 rounded-xl hover:bg-red-950/40 transition-colors border border-red-800/20" title="Reject">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </button>
                  <button onClick={() => openActionModal(officer, "blacklist")} className="p-2 bg-purple-950/20 rounded-xl hover:bg-purple-950/40 transition-colors border border-purple-800/20" title="Blacklist">
                    <Ban className="w-4 h-4 text-purple-400" />
                  </button>
                  <button onClick={() => openActionModal(officer, "flag")} className="p-2 bg-orange-950/20 rounded-xl hover:bg-orange-950/40 transition-colors border border-orange-800/20" title="Flag Suspicious">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  </button>
                  <button onClick={() => openActionModal(officer, "clarification")} className="p-2 bg-yellow-950/20 rounded-xl hover:bg-yellow-950/40 transition-colors border border-yellow-800/20" title="Request Clarification">
                    <Upload className="w-4 h-4 text-yellow-400" />
                  </button>
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

      {/* Action Modal */}
      {showActionModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-border/60 bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${actionLabels[actionType].color.replace("text-", "border-").replace("400", "800/30")} ${actionLabels[actionType].color.replace("text-", "bg-").replace("400", "950/20")}`}>
                {React.createElement(actionLabels[actionType].icon, { className: `w-5 h-5 ${actionLabels[actionType].color}` })}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{actionLabels[actionType].title}</h3>
                <p className="text-xs text-muted-foreground">{selectedOfficer.name} - {selectedOfficer.ministry}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Remarks *</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={`Enter remarks for ${actionType}...`}
                className="w-full h-24 p-3 text-xs bg-background border border-border rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              />
            </div>

            {actionError && <p className="text-xs text-destructive">{actionError}</p>}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowActionModal(false)}>Cancel</Button>
              <Button className={`flex-1 ${actionLabels[actionType].btnColor} text-white`}
                onClick={handleAction}
                loading={actionLoading}
                disabled={!remarks.trim()}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfficersPage() {
  return (
    <ErrorBoundary>
      <OfficersPageContent />
    </ErrorBoundary>
  );
}