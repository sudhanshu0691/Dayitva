"use client";

import React from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(3,105,161,0.08),rgba(255,255,255,0))]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl p-6 sm:p-8 text-center space-y-6 card-3d-tilt shadow-depth">
        <div className="flex justify-center">
          <div className="bg-muted p-4 rounded-xl border border-border">
            <FileQuestion className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-headline-md font-semibold text-foreground">Page not found</h1>
          <p className="text-body-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center">
          <Button variant="accent" onClick={() => window.location.href = "/"} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}