"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Key } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

function UnauthorizedContent() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(255,255,255,0))]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(13,148,136,0.1)] text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full border border-destructive/30">
            <ShieldAlert className="w-12 h-12 text-destructive animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-500">
            SIGNATURE INVALID
          </h1>
          <p className="text-sm font-bold text-muted-foreground">
            Your wallet address does not possess the correct cryptographic roles.
          </p>
        </div>

        <div className="bg-muted border border-border rounded-lg p-4 text-left space-y-2 text-sm text-muted-foreground font-mono">
          <div className="flex items-center space-x-2 text-destructive/80">
            <Key className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cryptographic Proof Status</span>
          </div>
          <div className="text-xs space-y-1">
            <p aria-label="Permission denied">{'>'} PERMISSION: ACCESS_DENIED</p>
            <p aria-label="Signature mismatch">{'>'} SIGNATURE_STATUS: MISMATCH</p>
            <p aria-label="Required role">{'>'} ROLE_REQUIRED: GOVT_ADMIN_ROLE</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <BackButton href="/" label="RETURN TO MAIN CHAIN" variant="full" />
        </div>
      </div>
    </main>
  );
}

export default function UnauthorizedPage() {
  return (
    <ErrorBoundary>
      <UnauthorizedContent />
    </ErrorBoundary>
  );
}