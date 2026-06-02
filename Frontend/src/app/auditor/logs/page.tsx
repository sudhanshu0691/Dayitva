"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Search, RefreshCw, ShieldCheck,
  ArrowLeft, ChevronLeft, ChevronRight, Clock
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import auditorService from "@/services/auditorService";

function LogsPageContent() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getActivityLogs(page, 50);
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "APPROVE": return "text-emerald-400 bg-emerald-950/20";
      case "REJECT": return "text-red-400 bg-red-950/20";
      case "BLACKLIST": return "text-purple-400 bg-purple-950/20";
      case "LOGIN": return "text-blue-400 bg-blue-950/20";
      case "LOGOUT": return "text-muted-foreground bg-muted";
      case "FLAG_SUSPICIOUS": return "text-orange-400 bg-orange-950/20";
      case "RE_UPLOAD_REQUEST": return "text-yellow-400 bg-yellow-950/20";
      case "REGISTER": return "text-teal-400 bg-teal-950/20";
      case "PASSWORD_CHANGE": return "text-red-400 bg-red-950/20";
      default: return "text-muted-foreground bg-muted";
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
              <h1 className="text-lg font-black text-foreground tracking-tight">Activity Logs</h1>
              <p className="text-xs text-muted-foreground">Complete audit trail of all auditor actions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Timestamp</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Auditor</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Action</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Description</th>
                      <th className="text-left p-3 font-mono text-muted-foreground uppercase">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{log.auditor?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{log.auditor?.officialEmail}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getActionColor(log.actionType)}`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[300px] truncate">{log.description || "-"}</td>
                        <td className="p-3">
                          {log.targetType ? (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {log.targetType}: {log.targetId?.substring(0, 8)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">-</span>
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

export default function LogsPage() {
  return (
    <ErrorBoundary>
      <LogsPageContent />
    </ErrorBoundary>
  );
}