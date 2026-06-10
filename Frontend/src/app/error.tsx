"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(3,105,161,0.08),rgba(255,255,255,0))]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl p-6 sm:p-8 text-center space-y-6 card-3d-tilt shadow-depth">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-headline-md font-semibold text-foreground">Something went wrong</h1>
          <p className="text-body-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        {error?.digest && (
          <div className="bg-muted border border-border rounded-lg p-3 text-left">
            <p className="text-caption text-muted-foreground font-mono break-all">Digest: {error.digest}</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="accent" onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    </main>
  );
}