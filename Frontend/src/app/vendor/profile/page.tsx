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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your company profile and KYC verification</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500">Company Name</label>
            <p className="text-sm text-slate-200 mt-1">{currentUser?.companyName || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">Contact Email</label>
            <p className="text-sm text-slate-200 mt-1">{currentUser?.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">Registration Number</label>
            <p className="text-sm text-slate-200 mt-1">{currentUser?.regNumber || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">PAN</label>
            <p className="text-sm text-slate-200 mt-1">{currentUser?.pan || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">GST</label>
            <p className="text-sm text-slate-200 mt-1">{currentUser?.gst || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">Role</label>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-medium mt-1">
              Vendor
            </span>
          </div>
          {currentUser?.walletAddress && (
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">Wallet Address</label>
              <p className="text-sm text-slate-200 mt-1 font-mono text-xs truncate">
                {currentUser.walletAddress}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KYC Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-foreground">KYC Verification</h2>
        </div>
        <KYCWidget />
      </div>
    </div>
  );
}