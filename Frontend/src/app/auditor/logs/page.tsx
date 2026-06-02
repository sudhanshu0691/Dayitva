"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Search, RefreshCw, ShieldCheck,
  ArrowLeft, ChevronLeft, ChevronRight, Clock, UserRound
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Button } from "../../../components/ui/button";
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
      case "APPROVE": return "text-emerald-400 bg-emerald-950/20 border-emerald-800/30";
      case "REJECT": return "text-red-400 bg-red-950/20 border-red-800/30";
      case "BLACKLIST": return "text-purple-400 bg-purple-950/20 border-purple-800/30";
      case "LOGIN": return "text-blue-400 bg-blue-950/20 border-blue-800/30";
      case "LOGOUT": return "text-muted-foreground bg-muted";
      case "FLAG_SUSPICIOUS": return "text-orange-400 bg-orange-950/20 border-orange-800/30";
      case "RE_UPLOAD_REQUEST": return "text-yellow-400 bg-yellow-950/20 border-yellow-800/30";
      case "REGISTER": return "text-teal-400 bg-teal-950/20 border-teal-800/30";
      case "PASSWORD_CHANGE": return "text-red-400 bg-red-950/20 border-red-800/30";
      default: return "text-muted-foreground bg-muted";
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
              <Activity className="w-6 h-6 text-blue-400" />
              Activity Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete audit trail of all auditor actions
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Logs */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card/30 p-5">
              <div className="h-4 bg-slate-700/50 rounded w-48 mb-2"></div>
              <div className="h-3 bg-slate-700/50 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div key={log.id} className="rounded-2xl border border-border/60 bg-card/40 p-4 hover:bg-card/60 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{log.auditor?.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{log.auditor?.officialEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionColor(log.actionType)}`}>
                    {log.actionType}
                  </span>
                  {log.targetType && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {log.targetType}: {log.targetId?.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
              {log.description && (
                <p className="text-xs text-muted-foreground mt-2 ml-1">{log.description}</p>
              )}
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

export default function LogsPage() {
  return (
    <ErrorBoundary>
      <LogsPageContent />
    </ErrorBoundary>
  );
}