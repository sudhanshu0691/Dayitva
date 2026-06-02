"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Search, RefreshCw, ShieldCheck,
  ArrowLeft, Users, Building, Copy, XCircle, Fingerprint
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Button } from "../../../components/ui/button";
import auditorService from "@/services/auditorService";

function FraudPageContent() {
  const router = useRouter();
  const [fraudData, setFraudData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getFraudMonitoring();
      setFraudData(data);
    } catch (err) {
      console.error("Failed to fetch fraud data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-red-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-mono">Loading fraud monitoring...</p>
        </div>
      </div>
    );
  }

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
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Fraud Monitoring
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detect suspicious accounts, duplicates, and fraudulent activities
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFraudData}>
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-red-800/30 bg-card/40 p-4">
          <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-xl font-black text-foreground">{fraudData?.flaggedAccounts?.length || 0}</p>
          <p className="text-[10px] font-mono text-red-400 uppercase">Flagged Accounts</p>
        </div>
        <div className="rounded-2xl border border-orange-800/30 bg-card/40 p-4">
          <Copy className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-xl font-black text-foreground">{fraudData?.duplicateGST?.length || 0}</p>
          <p className="text-[10px] font-mono text-orange-400 uppercase">Duplicate GST</p>
        </div>
        <div className="rounded-2xl border border-yellow-800/30 bg-card/40 p-4">
          <Copy className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-xl font-black text-foreground">{fraudData?.duplicatePAN?.length || 0}</p>
          <p className="text-[10px] font-mono text-yellow-400 uppercase">Duplicate PAN</p>
        </div>
        <div className="rounded-2xl border border-purple-800/30 bg-card/40 p-4">
          <XCircle className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-xl font-black text-foreground">{fraudData?.multipleKycFailures || 0}</p>
          <p className="text-[10px] font-mono text-purple-400 uppercase">3+ KYC Failures</p>
        </div>
      </div>

      {/* Flagged Accounts */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Flagged Suspicious Accounts
        </h2>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          {fraudData?.flaggedAccounts?.length > 0 ? (
            <div className="space-y-2">
              {fraudData.flaggedAccounts.map((acc: any) => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-red-950/10 rounded-xl border border-red-800/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{acc.companyName || acc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{acc.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      acc.userType === "vendor" 
                        ? "text-teal-400 bg-teal-950/20 border-teal-800/30" 
                        : "text-blue-400 bg-blue-950/20 border-blue-800/30"
                    }`}>
                      {acc.userType?.toUpperCase()}
                    </span>
                    {acc.fraudReason && <p className="text-[10px] text-red-400 mt-1">{acc.fraudReason}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(acc.flaggedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No flagged accounts</p>
          )}
        </div>
      </div>

      {/* Duplicate GST */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Copy className="w-5 h-5 text-orange-400" />
          Duplicate GST Numbers
        </h2>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          {fraudData?.duplicateGST?.length > 0 ? (
            <div className="space-y-2">
              {fraudData.duplicateGST.map(([gst, users]: [string, any[]], idx: number) => (
                <div key={idx} className="p-3 bg-orange-950/10 rounded-xl border border-orange-800/20">
                  <p className="text-xs font-mono font-bold text-orange-400">GST: {gst}</p>
                  <div className="mt-1 space-y-1">
                    {users.map((u: any) => (
                      <p key={u.id} className="text-[10px] text-muted-foreground ml-2">
                        • {u.companyName || u.name} ({u.email})
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No duplicate GST detected</p>
          )}
        </div>
      </div>

      {/* Duplicate PAN */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-yellow-400" />
          Duplicate PAN Numbers
        </h2>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          {fraudData?.duplicatePAN?.length > 0 ? (
            <div className="space-y-2">
              {fraudData.duplicatePAN.map(([pan, users]: [string, any[]], idx: number) => (
                <div key={idx} className="p-3 bg-yellow-950/10 rounded-xl border border-yellow-800/20">
                  <p className="text-xs font-mono font-bold text-yellow-400">PAN: {pan}</p>
                  <div className="mt-1 space-y-1">
                    {users.map((u: any) => (
                      <p key={u.id} className="text-[10px] text-muted-foreground ml-2">
                        • {u.companyName || u.name} ({u.email})
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No duplicate PAN detected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FraudPage() {
  return (
    <ErrorBoundary>
      <FraudPageContent />
    </ErrorBoundary>
  );
}