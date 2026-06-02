"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, CheckCircle2, XCircle, Ban, AlertTriangle,
  RefreshCw, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight,
  Upload, Building, BadgeCheck
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
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
      case "Approved": return "text-emerald-400 bg-emerald-950/20";
      case "Rejected": return "text-red-400 bg-red-950/20";
      case "Pending": return "text-yellow-400 bg-yellow-950/20";
      case "Blacklisted": return "text-purple-400 bg-purple-950/20";
      case "Suspicious": return "text-orange-400 bg-orange-950/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const actionLabels = {
    approve: { title: "Approve Officer", color: "text-emerald-400", btnColor: "bg-emerald-700 hover:bg-emerald-800" },
    reject: { title: "Reject Officer", color: "text-red-400", btnColor: "bg-red-700 hover:bg-red-800" },
    blacklist: { title: "Blacklist Officer", color: "text-purple-400", btnColor: "bg-purple-700 hover:bg-purple-800" },
    clarification: { title: "Request Clarification", color: "text-yellow-400", btnColor: "bg-yellow-700 hover:bg-yellow-800" },
    flag: { title: "Flag Suspicious Activity", color: "text-orange-400", btnColor: "bg-orange-700 hover:bg-orange-800" },
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
              <h1 className="text-lg font-black text-foreground tracking-tight">Officer Verification</h1>
              <p className="text-xs text-muted-foreground">Review and verify government officer accounts</p>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-red-400" />
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 font-mono rounded-lg">{successMsg}</div>
        )}

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

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading officers...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No officers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Name</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Email</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Department</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Designation</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Status</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Joined</th>
                      <th className="text-right p-3 font-mono text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer) => (
                      <tr key={officer.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{officer.name}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{officer.email}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span>{officer.ministry || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{officer.designation || "N/A"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getStatusColor(officer.kycStatus)}`}>
                            {officer.kycStatus}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(officer.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <button onClick={() => openActionModal(officer, "approve")} className="p-1.5 bg-emerald-950/20 rounded hover:bg-emerald-950/40" title="Approve">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                            <button onClick={() => openActionModal(officer, "reject")} className="p-1.5 bg-red-950/20 rounded hover:bg-red-950/40" title="Reject">
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            </button>
                            <button onClick={() => openActionModal(officer, "blacklist")} className="p-1.5 bg-purple-950/20 rounded hover:bg-purple-950/40" title="Blacklist">
                              <Ban className="w-3.5 h-3.5 text-purple-400" />
                            </button>
                            <button onClick={() => openActionModal(officer, "flag")} className="p-1.5 bg-orange-950/20 rounded hover:bg-orange-950/40" title="Flag Suspicious">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                            <button onClick={() => openActionModal(officer, "clarification")} className="p-1.5 bg-yellow-950/20 rounded hover:bg-yellow-950/40" title="Request Clarification">
                              <Upload className="w-3.5 h-3.5 text-yellow-400" />
                            </button>
                          </div>
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

      {/* Action Modal */}
      {showActionModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="space-y-4 py-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${actionLabels[actionType].color.replace("text-", "bg-").replace("400", "950/30")}`}>
                  {actionType === "approve" ? <CheckCircle2 className="w-4 h-4" /> :
                   actionType === "reject" ? <XCircle className="w-4 h-4" /> :
                   actionType === "blacklist" ? <Ban className="w-4 h-4" /> :
                   actionType === "flag" ? <AlertTriangle className="w-4 h-4" /> :
                   <Upload className="w-4 h-4" />}
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
                  className="w-full h-24 p-2.5 text-xs bg-background border border-border rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
                />
              </div>
              {actionError && <p className="text-xs text-destructive">{actionError}</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowActionModal(false)}>Cancel</Button>
                <Button className={`flex-1 ${actionLabels[actionType].btnColor}`} onClick={handleAction} loading={actionLoading} loadingText="Processing..." disabled={!remarks.trim()}>Confirm</Button>
              </div>
            </CardContent>
          </Card>
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