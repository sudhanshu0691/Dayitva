"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, ShieldCheck, Upload, CheckCircle2, XCircle,
  AlertCircle, AlertTriangle, ArrowLeft, Save
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import userService from "@/services/userService";

export default function OfficerProfile() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();

  const [profileData, setProfileData] = useState({
    name: "",
    designation: "",
    ministry: "",
    ministryCode: "",
  });
  const [kycData, setKycData] = useState({
    pan: "",
    gst: "",
    designation: "",
    ministry: "",
    ministryCode: "",
  });
  const [saving, setSaving] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    if (!hydrated || !currentUser) return;
    
    setProfileData({
      name: currentUser.name || "",
      designation: currentUser.designation || "",
      ministry: currentUser.ministry || "",
      ministryCode: currentUser.ministryCode || "",
    });
    
    setKycData({
      pan: currentUser.pan || "",
      gst: currentUser.gst || "",
      designation: currentUser.designation || "",
      ministry: currentUser.ministry || "",
      ministryCode: currentUser.ministryCode || "",
    });

    fetchKycStatus();
  }, [hydrated, currentUser]);

  const fetchKycStatus = async () => {
    try {
      const status = await userService.getKYCStatus();
      setKycStatus(status);
    } catch {
      setKycStatus(currentUser?.kycStatus || "Pending");
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Government Officer credentials required.</p>
        <button onClick={() => router.push("/login")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Go to Login</button>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await userService.updateProfile(profileData);
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingKyc(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await userService.submitKYC(kycData);
      setSuccess("KYC documents submitted for auditor verification");
      setKycStatus("UnderReview");
      fetchKycStatus();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit KYC");
    } finally {
      setSubmittingKyc(false);
    }
  };

  const kycDisplayStatus = kycStatus?.kycStatus || currentUser.kycStatus || "Pending";
  const isKycApproved = kycDisplayStatus === "Approved";
  const isKycRejected = kycDisplayStatus === "Rejected";

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 space-y-6">
      <button onClick={() => router.push("/admin")} 
        className="flex items-center space-x-1 text-xs font-bold text-muted-foreground hover:text-teal-400 font-mono">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Profile Header */}
      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-orange-500/40 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-[#FF9933]" />
        </div>
        <h2 className="text-base font-black text-foreground">{currentUser.name}</h2>
        <span className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider block mt-1">{currentUser.designation}</span>
        <div className="p-3 bg-muted/40 rounded-xl mt-6 space-y-2 text-left text-xs font-semibold text-foreground">
          <div className="flex justify-between border-b border-border/40 pb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Ministry</span>
            <span className="font-extrabold text-right">{currentUser.ministry}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Email</span>
            <span className="font-extrabold">{currentUser.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">KYC Status</span>
            <span className={`font-extrabold uppercase ${isKycApproved ? "text-emerald-400" : isKycRejected ? "text-red-400" : "text-amber-400"}`}>
              {kycDisplayStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Errors & Success */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/20 text-xs text-emerald-400 rounded-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-card border border-border/80 rounded-2xl p-6">
          <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-3 mb-6 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Full Name</label>
              <input type="text" value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Email</label>
              <input type="email" value={currentUser.email} disabled
                className="w-full bg-muted/50 border border-input rounded-lg p-2.5 text-xs font-semibold opacity-70 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Designation</label>
              <input type="text" value={profileData.designation}
                onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Ministry</label>
              <input type="text" value={profileData.ministry}
                onChange={(e) => setProfileData({...profileData, ministry: e.target.value})}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Ministry Code</label>
              <input type="text" value={profileData.ministryCode}
                onChange={(e) => setProfileData({...profileData, ministryCode: e.target.value})}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* KYC Section */}
        <div className="bg-card border border-border/80 rounded-2xl p-6">
          <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-3 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            KYC Verification
          </h3>

          {/* KYC Status Badge */}
          <div className={`mb-6 p-3 rounded-xl border text-xs font-bold font-mono ${
            isKycApproved
              ? "bg-emerald-950/20 border-emerald-800/20 text-emerald-400"
              : isKycRejected
                ? "bg-red-950/20 border-red-800/20 text-red-400"
                : "bg-amber-950/20 border-amber-800/20 text-amber-400"
          }`}>
            <div className="flex items-center gap-2">
              {isKycApproved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isKycRejected ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span>KYC Status: <strong>{kycDisplayStatus}</strong></span>
            </div>
            {isKycApproved ? (
              <p className="text-[10px] text-emerald-400/70 mt-2 font-normal">You can create and manage tenders.</p>
            ) : isKycRejected ? (
              <p className="text-[10px] text-red-400/70 mt-2 font-normal">Your KYC was rejected. Please update documents and resubmit.</p>
            ) : (
              <p className="text-[10px] text-amber-400/70 mt-2 font-normal">Submit your KYC documents below. Auditor will verify.</p>
            )}
          </div>

          {/* KYC Upload Form */}
          {!isKycApproved ? (
            <form onSubmit={handleKYCSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">PAN Number</label>
                <input type="text" placeholder="e.g., ABCDE1234F" value={kycData.pan}
                  onChange={(e) => setKycData({...kycData, pan: e.target.value})}
                  className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">GST Number</label>
                <input type="text" placeholder="e.g., 22ABCDE1234F1Z5" value={kycData.gst}
                  onChange={(e) => setKycData({...kycData, gst: e.target.value})}
                  className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Designation</label>
                <input type="text" placeholder="Your designation" value={kycData.designation}
                  onChange={(e) => setKycData({...kycData, designation: e.target.value})}
                  className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Ministry</label>
                <input type="text" placeholder="Your ministry/department" value={kycData.ministry}
                  onChange={(e) => setKycData({...kycData, ministry: e.target.value})}
                  className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Ministry Code</label>
                <input type="text" placeholder="e.g., MORTH/2024/001" value={kycData.ministryCode}
                  onChange={(e) => setKycData({...kycData, ministryCode: e.target.value})}
                  className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button type="submit" disabled={submittingKyc}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                <Upload className="w-4 h-4" />
                {submittingKyc ? "Submitting..." : "Submit KYC for Verification"}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">KYC Already Verified</p>
              <p className="text-xs text-muted-foreground mt-1">Your identity has been verified and approved by Auditor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}