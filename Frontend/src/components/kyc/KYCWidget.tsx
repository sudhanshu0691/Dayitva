"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { kycService } from "../../services/kycService";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function KYCWidget() {
  const { currentUser } = useApp();
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadKYCStatus();
    }
  }, [currentUser]);

  const loadKYCStatus = async () => {
    try {
      const data = await kycService.getStatus();
      setKycData(data);
    } catch (err) {
      console.error("Failed to load KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setUploading(true);
    try {
      // Convert files to base64 for upload (replace with actual upload logic)
      const documents: string[] = [];
      const documentTypes: string[] = [];

      for (const file of selectedFiles) {
        const base64 = await fileToBase64(file);
        documents.push(base64);
        documentTypes.push(file.name.split(".").pop() || "unknown");
      }

      await kycService.submitKYC({ documents, documentTypes });
      toast.success("KYC documents submitted successfully!");
      setSelectedFiles([]);
      await loadKYCStatus();
      // Refresh user data
      try {
        const authService = await import("../../services/authService").then(m => m.default);
        const user = await authService.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(user));
      } catch {}
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload KYC documents");
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      case "UnderReview":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 text-sm font-medium">
            <ShieldX className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-border/60 bg-card/30 p-5 space-y-3">
        <div className="h-4 bg-slate-700/50 rounded w-24"></div>
        <div className="h-8 bg-slate-700/50 rounded w-32"></div>
      </div>
    );
  }

  const status = kycData?.kycStatus || "Pending";
  const remarks = kycData?.kycRemarks;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-200">KYC Verification</h3>
        </div>
        {getStatusBadge(status)}
      </div>

      {remarks && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-300">Auditor Remarks</p>
            <p className="text-sm text-slate-300 mt-0.5">{remarks}</p>
          </div>
        </div>
      )}

      {status !== "Approved" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Upload your KYC documents (PAN, Aadhaar, Business Registration, etc.)</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-600 hover:border-teal-500/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-sm text-slate-400">
                <Upload className="w-4 h-4" />
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "Choose files"}
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-all disabled:cursor-not-allowed whitespace-nowrap"
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </div>

          {status === "Rejected" && (
            <p className="text-xs text-amber-400">
              Your previous KYC was rejected. Please upload corrected documents for re-verification.
            </p>
          )}
        </div>
      )}

      {kycData?.kycRequests?.length > 0 && (
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs text-slate-500 mb-2">Submission History</p>
          {kycData.kycRequests.map((req: any) => (
            <div
              key={req.id}
              className="flex items-center justify-between py-1.5 text-xs text-slate-400"
            >
              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              <span className={req.status === "Approved" ? "text-emerald-400" : req.status === "Rejected" ? "text-red-400" : "text-amber-400"}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}