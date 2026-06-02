"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Search, RefreshCw, ShieldCheck,
  ArrowLeft, Users, Building, Copy, XCircle
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
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
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading fraud monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/auditor/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">Fraud Monitoring</h1>
              <p className="text-xs text-muted-foreground">Detect suspicious accounts, duplicates, and fraudulent activities</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFraudData}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-red-800/30 bg-red-950/10">
            <CardContent className="p-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mb-1" />
              <p className="text-lg font-black text-foreground">{fraudData?.flaggedAccounts?.length || 0}</p>
              <p className="text-[10px] font-mono text-red-400 uppercase">Flagged Accounts</p>
            </CardContent>
          </Card>
          <Card className="border border-orange-800/30 bg-orange-950/10">
            <CardContent className="p-3">
              <Copy className="w-4 h-4 text-orange-400 mb-1" />
              <p className="text-lg font-black text-foreground">{fraudData?.duplicateGST?.length || 0}</p>
              <p className="text-[10px] font-mono text-orange-400 uppercase">Duplicate GST</p>
            </CardContent>
          </Card>
          <Card className="border border-yellow-800/30 bg-yellow-950/10">
            <CardContent className="p-3">
              <Copy className="w-4 h-4 text-yellow-400 mb-1" />
              <p className="text-lg font-black text-foreground">{fraudData?.duplicatePAN?.length || 0}</p>
              <p className="text-[10px] font-mono text-yellow-400 uppercase">Duplicate PAN</p>
            </CardContent>
          </Card>
          <Card className="border border-purple-800/30 bg-purple-950/10">
            <CardContent className="p-3">
              <XCircle className="w-4 h-4 text-purple-400 mb-1" />
              <p className="text-lg font-black text-foreground">{fraudData?.multipleKycFailures || 0}</p>
              <p className="text-[10px] font-mono text-purple-400 uppercase">3+ KYC Failures</p>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Accounts */}
        <Card className="border border-red-800/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Flagged Suspicious Accounts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-mono text-muted-foreground uppercase">User</th>
                    <th className="text-left p-2 font-mono text-muted-foreground uppercase">Type</th>
                    <th className="text-left p-2 font-mono text-muted-foreground uppercase">Fraud Reason</th>
                    <th className="text-left p-2 font-mono text-muted-foreground uppercase">Flagged Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fraudData?.flaggedAccounts?.length > 0 ? fraudData.flaggedAccounts.map((acc: any) => (
                    <tr key={acc.id} className="border-b border-border/50">
                      <td className="p-2">
                        <p className="font-semibold text-foreground">{acc.companyName || acc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{acc.email}</p>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${acc.userType === "vendor" ? "text-teal-400 bg-teal-950/20" : "text-blue-400 bg-blue-950/20"}`}>
                          {acc.userType?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2 text-red-400">{acc.fraudReason}</td>
                      <td className="p-2 text-muted-foreground">{new Date(acc.flaggedAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">No flagged accounts</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate GST */}
        <Card className="border border-orange-800/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-orange-400" />
              Duplicate GST Numbers
            </h3>
            {fraudData?.duplicateGST?.length > 0 ? (
              <div className="space-y-2">
                {fraudData.duplicateGST.map(([gst, users]: [string, any[]], idx: number) => (
                  <div key={idx} className="p-2 bg-orange-950/10 rounded-lg border border-orange-800/20">
                    <p className="text-xs font-mono font-bold text-orange-400">GST: {gst}</p>
                    <div className="mt-1 space-y-1">
                      {users.map((u: any) => (
                        <p key={u.id} className="text-[10px] text-muted-foreground">
                          {u.companyName || u.name} ({u.email})
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No duplicate GST detected</p>
            )}
          </CardContent>
        </Card>

        {/* Duplicate PAN */}
        <Card className="border border-yellow-800/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-yellow-400" />
              Duplicate PAN Numbers
            </h3>
            {fraudData?.duplicatePAN?.length > 0 ? (
              <div className="space-y-2">
                {fraudData.duplicatePAN.map(([pan, users]: [string, any[]], idx: number) => (
                  <div key={idx} className="p-2 bg-yellow-950/10 rounded-lg border border-yellow-800/20">
                    <p className="text-xs font-mono font-bold text-yellow-400">PAN: {pan}</p>
                    <div className="mt-1 space-y-1">
                      {users.map((u: any) => (
                        <p key={u.id} className="text-[10px] text-muted-foreground">
                          {u.companyName || u.name} ({u.email})
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No duplicate PAN detected</p>
            )}
          </CardContent>
        </Card>
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