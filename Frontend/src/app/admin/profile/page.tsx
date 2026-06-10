"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, ShieldCheck, Upload, CheckCircle2, XCircle,
  AlertCircle, AlertTriangle, ArrowLeft, Save
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import userService from "@/services/userService";
import { Button } from "../../../components/ui/button";

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
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-headline-sm font-semibold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Government Officer credentials required.</p>
        <Button onClick={() => router.push("/login")} className="mt-6">Go to Login</Button>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await userService.updateProfile(profileData);
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
      await userService.submitKYC(kycData);
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
    <div className="w-full max-w-4xl mx-auto px-6 py-10 space-y-6 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-1" style={{ left: '-5%', top: '10%' }} />
      </div>
      <button onClick={() => router.push("/admin")} 
        className="flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-accent transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Profile Header */}
      <div className="p-6 bg-card border border-border rounded-xl text-center card-3d-tilt shadow-depth">
        <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-headline-sm font-semibold text-foreground">{currentUser.name}</h2>
        <span className="text-caption text-accent font-semibold uppercase tracking-wider block mt-1">{currentUser.designation}</span>
        <div className="p-4 bg-surface-container-low border border-border rounded-xl mt-6 space-y-2 text-left text-body-sm text-foreground">
          <div className="flex justify-between border-b border-border pb-1.5">
            <span className="text-caption text-muted-foreground uppercase">Ministry</span>
            <span className="font-semibold text-right">{currentUser.ministry}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1.5">
            <span className="text-caption text-muted-foreground uppercase">Email</span>
            <span className="font-semibold">{currentUser.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-muted-foreground uppercase">KYC Status</span>
            <span className={`font-semibold uppercase ${isKycApproved ? "text-success" : isKycRejected ? "text-destructive" : "text-warning"}`}>
              {kycDisplayStatus}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-success/10 border border-success/20 text-body-sm text-success rounded-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-3 mb-6 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground font-semibold block">Full Name</label>
              <input type="text" value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground font-semibold block">Email</label>
              <input type="email" value={currentUser.email} disabled
                className="w-full h-11 bg-muted border-2 border-input text-muted-foreground px-3.5 text-body-sm rounded-xl opacity-70 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground font-semibold block">Designation</label>
              <input type="text" value={profileData.designation}
                onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground font-semibold block">Ministry</label>
              <input type="text" value={profileData.ministry}
                onChange={(e) => setProfileData({...profileData, ministry: e.target.value})}
                className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground font-semibold block">Ministry Code</label>
              <input type="text" value={profileData.ministryCode}
                onChange={(e) => setProfileData({...profileData, ministryCode: e.target.value})}
                className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={saving} loading={saving} loadingText="Saving...">
              <Save className="w-4 h-4" />
              Save Profile
            </Button>
          </form>
        </div>

        {/* KYC Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-3 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            KYC Verification
          </h3>

          {/* KYC Status Badge */}
          <div className={`mb-6 p-3 rounded-xl border text-body-sm font-semibold ${
            isKycApproved
              ? "bg-success/10 border-success/20 text-success"
              : isKycRejected
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-warning/10 border-warning/20 text-warning"
          }`}>
            <div className="flex items-center gap-2">
              {isKycApproved ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : isKycRejected ? (
                <XCircle className="w-5 h-5 text-destructive" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              <span>KYC Status: <strong>{kycDisplayStatus}</strong></span>
            </div>
            {isKycApproved ? (
              <p className="text-caption text-success/80 mt-2 font-normal">You can create and manage tenders.</p>
            ) : isKycRejected ? (
              <p className="text-caption text-destructive/80 mt-2 font-normal">Your KYC was rejected. Please update documents and resubmit.</p>
            ) : (
              <p className="text-caption text-warning/80 mt-2 font-normal">Submit your KYC documents below. Auditor will verify.</p>
            )}
          </div>

          {!isKycApproved ? (
            <form onSubmit={handleKYCSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption text-muted-foreground font-semibold block">PAN Number</label>
                <input type="text" placeholder="e.g., ABCDE1234F" value={kycData.pan}
                  onChange={(e) => setKycData({...kycData, pan: e.target.value})}
                  className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-caption text-muted-foreground font-semibold block">GST Number</label>
                <input type="text" placeholder="e.g., 22ABCDE1234F1Z5" value={kycData.gst}
                  onChange={(e) => setKycData({...kycData, gst: e.target.value})}
                  className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-caption text-muted-foreground font-semibold block">Designation</label>
                <input type="text" placeholder="Your designation" value={kycData.designation}
                  onChange={(e) => setKycData({...kycData, designation: e.target.value})}
                  className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-caption text-muted-foreground font-semibold block">Ministry</label>
                <input type="text" placeholder="Your ministry/department" value={kycData.ministry}
                  onChange={(e) => setKycData({...kycData, ministry: e.target.value})}
                  className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-caption text-muted-foreground font-semibold block">Ministry Code</label>
                <input type="text" placeholder="e.g., MORTH/2024/001" value={kycData.ministryCode}
                  onChange={(e) => setKycData({...kycData, ministryCode: e.target.value})}
                  className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all font-mono" />
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={submittingKyc} loading={submittingKyc} loadingText="Submitting...">
                <Upload className="w-4 h-4" />
                Submit KYC for Verification
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-body-sm font-semibold text-foreground">KYC Already Verified</p>
              <p className="text-caption text-muted-foreground mt-1">Your identity has been verified and approved by Auditor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
