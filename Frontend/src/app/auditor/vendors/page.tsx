"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building, Search, CheckCircle2, XCircle, Ban, AlertTriangle,
  RefreshCw, Eye, MessageSquare, ShieldCheck, ArrowLeft, ChevronLeft,
  ChevronRight, Upload
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import auditorService from "@/services/auditorService";

function VendorsPageContent() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "blacklist" | "reupload" | "flag">("approve");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, [page]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getVendors(page, 20, search || undefined);
      setVendors(data.vendors || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openActionModal = (vendor: any, type: "approve" | "reject" | "blacklist" | "reupload" | "flag") => {
    setSelectedVendor(vendor);
    setActionType(type);
    setRemarks("");
    setActionError(null);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedVendor || !remarks.trim()) {
      setActionError("Remarks are required");
      return;
    }
    setActionLoading(true);
    setActionError(null);

    try {
      switch (actionType) {
        case "approve":
          await auditorService.approve(selectedVendor.id, remarks, "vendor");
          setSuccessMsg("Vendor approved successfully");
          break;
        case "reject":
          await auditorService.reject(selectedVendor.id, remarks, "vendor");
          setSuccessMsg("Vendor rejected");
          break;
        case "blacklist":
          await auditorService.blacklist(selectedVendor.id, remarks, "vendor");
          setSuccessMsg("Vendor blacklisted");
          break;
        case "reupload":
          await auditorService.requestReUpload(selectedVendor.id, remarks, "vendor");
          setSuccessMsg("Re-upload requested");
          break;
        case "flag":
          await auditorService.flagSuspicious(selectedVendor.id, remarks, "vendor");
          setSuccessMsg("Vendor flagged as suspicious");
          break;
      }
      setShowActionModal(false);
      fetchVendors();
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
    approve: { title: "Approve Vendor", color: "text-emerald-400", btnColor: "bg-emerald-700 hover:bg-emerald-800" },
    reject: { title: "Reject Vendor", color: "text-red-400", btnColor: "bg-red-700 hover:bg-red-800" },
    blacklist: { title: "Blacklist Vendor", color: "text-purple-400", btnColor: "bg-purple-700 hover:bg-purple-800" },
    reupload: { title: "Request Re-upload", color: "text-yellow-400", btnColor: "bg-yellow-700 hover:bg-yellow-800" },
    flag: { title: "Flag as Suspicious", color: "text-orange-400", btnColor: "bg-orange-700 hover:bg-orange-800" },
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/auditor/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">Vendor Verification</h1>
              <p className="text-xs text-muted-foreground">Review and verify vendor KYC submissions</p>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-red-400" />
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 font-mono rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by GST, PAN, Company, Email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
            className="max-w-md"
          />
          <Button type="submit" variant="outline" size="sm">
            <Search className="w-4 h-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
            Clear
          </Button>
        </form>

        {/* Vendors list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading vendors...</span>
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vendors found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Company</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Email</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">GST/PAN</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Status</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Joined</th>
                      <th className="text-right p-3 font-mono text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{vendor.companyName || vendor.name}</p>
                          {vendor.regNumber && <p className="text-[10px] text-muted-foreground">{vendor.regNumber}</p>}
                        </td>
                        <td className="p-3 text-muted-foreground">{vendor.email}</td>
                        <td className="p-3 font-mono text-[10px]">
                          {vendor.gst && <div>GST: {vendor.gst}</div>}
                          {vendor.pan && <div>PAN: {vendor.pan}</div>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getStatusColor(vendor.kycStatus)}`}>
                            {vendor.kycStatus}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <button onClick={() => openActionModal(vendor, "approve")} className="p-1.5 bg-emerald-950/20 rounded hover:bg-emerald-950/40 transition-colors" title="Approve">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                            <button onClick={() => openActionModal(vendor, "reject")} className="p-1.5 bg-red-950/20 rounded hover:bg-red-950/40 transition-colors" title="Reject">
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            </button>
                            <button onClick={() => openActionModal(vendor, "blacklist")} className="p-1.5 bg-purple-950/20 rounded hover:bg-purple-950/40 transition-colors" title="Blacklist">
                              <Ban className="w-3.5 h-3.5 text-purple-400" />
                            </button>
                            <button onClick={() => openActionModal(vendor, "flag")} className="p-1.5 bg-orange-950/20 rounded hover:bg-orange-950/40 transition-colors" title="Flag Suspicious">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                            <button onClick={() => openActionModal(vendor, "reupload")} className="p-1.5 bg-yellow-950/20 rounded hover:bg-yellow-950/40 transition-colors" title="Request Re-upload">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedVendor && (
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
                  <p className="text-xs text-muted-foreground">{selectedVendor.companyName || selectedVendor.name}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Verification Remarks *</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={`Enter remarks for ${actionType}...`}
                  className="w-full h-24 p-2.5 text-xs bg-background border border-border rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              {actionError && <p className="text-xs text-destructive">{actionError}</p>}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowActionModal(false)}>
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${actionLabels[actionType].btnColor}`}
                  onClick={handleAction}
                  loading={actionLoading}
                  loadingText="Processing..."
                  disabled={!remarks.trim()}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function VendorsPage() {
  return (
    <ErrorBoundary>
      <VendorsPageContent />
    </ErrorBoundary>
  );
}