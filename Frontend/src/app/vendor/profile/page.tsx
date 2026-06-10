"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, ArrowLeft } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import KYCWidget from "../../../components/kyc/KYCWidget";

export default function VendorProfile() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-3" style={{ right: '-3%', top: '10%' }} />
      </div>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-body-sm text-muted-foreground hover:text-accent transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-accent" />
        <div>
          <h1 className="text-headline-sm font-semibold text-foreground">Company Profile</h1>
          <p className="text-body-sm text-muted-foreground">Manage your company profile and KYC verification</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-body-sm font-semibold text-foreground mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-caption text-muted-foreground">Company Name</label>
            <p className="text-body-sm text-foreground mt-1">{currentUser?.companyName || "N/A"}</p>
          </div>
          <div>
            <label className="text-caption text-muted-foreground">Contact Email</label>
            <p className="text-body-sm text-foreground mt-1">{currentUser?.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-caption text-muted-foreground">Registration Number</label>
            <p className="text-body-sm text-foreground mt-1">{currentUser?.regNumber || "N/A"}</p>
          </div>
          <div>
            <label className="text-caption text-muted-foreground">PAN</label>
            <p className="text-body-sm text-foreground mt-1">{currentUser?.pan || "N/A"}</p>
          </div>
          <div>
            <label className="text-caption text-muted-foreground">GST</label>
            <p className="text-body-sm text-foreground mt-1">{currentUser?.gst || "N/A"}</p>
          </div>
          <div>
            <label className="text-caption text-muted-foreground">Role</label>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-label-sm font-medium mt-1">
              Vendor
            </span>
          </div>
          {currentUser?.walletAddress && (
            <div className="md:col-span-2">
              <label className="text-caption text-muted-foreground">Wallet Address</label>
              <p className="text-body-sm text-foreground mt-1 font-mono truncate">
                {currentUser.walletAddress}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h2 className="text-headline-sm font-semibold text-foreground">KYC Verification</h2>
        </div>
        <KYCWidget />
      </div>
    </div>
  );
}
