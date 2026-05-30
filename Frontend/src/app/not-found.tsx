"use client";

import React from "react";
import { AlertCircle, Terminal } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

function NotFoundContent() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(255,255,255,0))]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(13,148,136,0.1)] text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full border border-destructive/30 animate-pulse">
            <AlertCircle className="w-12 h-12 text-destructive" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
            BLOCK #404 ERROR
          </h1>
          <p className="text-sm font-bold text-muted-foreground">
            The block hash or transaction index you specified could not be parsed.
          </p>
        </div>

        <div className="bg-muted border border-border rounded-lg p-4 text-left space-y-2 text-sm text-muted-foreground font-mono">
          <div className="flex items-center space-x-2 text-primary/80">
            <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Terminal Diagnostic Console</span>
          </div>
          <div className="text-xs space-y-1">
            <p aria-label="Status null pointer">{'>'} STATUS: NULL_POINTER_EXCEPTION</p>
            <p aria-label="IPFS hash undefined">{'>'} IPFS_HASH: UNDEFINED</p>
            <p aria-label="Transaction not found">{'>'} TX_STATUS: NOT_FOUND_ON_CHAIN</p>
          </div>
        </div>

        <div className="flex justify-center">
          <BackButton href="/" label="RETURN TO MAIN CHAIN" variant="full" />
        </div>
      </div>
    </main>
  );
}

export default function NotFound() {
  return (
    <ErrorBoundary>
      <NotFoundContent />
    </ErrorBoundary>
  );
}