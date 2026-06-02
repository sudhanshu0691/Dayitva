"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound, ShieldCheck, Lock, Mail, Phone, Building,
  ArrowLeft, RefreshCw, BadgeCheck, Calendar, Clock
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import auditorService from "@/services/auditorService";

function ProfilePageContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auditor");
    if (!stored) {
      router.push("/auditor/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await auditorService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setPhoneNumber(data.phoneNumber || "");
    } catch (err) {
      localStorage.removeItem("auditor");
      router.push("/auditor/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setError(null);
    try {
      const data = await auditorService.updateProfile({ fullName, phoneNumber });
      setProfile({ ...profile, ...data });
      setEditMode(false);
      setSuccessMsg("Profile updated successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await auditorService.changePassword(currentPassword, newPassword);
      setShowPasswordSection(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Password changed successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auditorService.logout(localStorage.getItem("auditorRefreshToken") || undefined);
    } catch {}
    localStorage.removeItem("auditorToken");
    localStorage.removeItem("auditorRefreshToken");
    localStorage.removeItem("auditor");
    router.push("/auditor/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/auditor/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">Auditor Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300 font-mono"
          >
            Logout
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 font-mono rounded-lg">{successMsg}</div>
        )}

        {/* Profile Card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center">
                <UserRound className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{profile?.fullName}</h2>
                <p className="text-xs text-muted-foreground">{profile?.officialEmail}</p>
                <div className="flex items-center gap-1 mt-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-mono">ACTIVE AUDITOR</span>
                </div>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Phone Number</label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="font-mono" />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleUpdateProfile} loading={updating} loadingText="Saving...">Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold text-foreground">{profile?.department}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <BadgeCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-semibold text-foreground font-mono">{profile?.employeeId}</span>
                </div>
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-semibold text-foreground">{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.lastLogin && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="font-semibold text-foreground">{new Date(profile.lastLogin).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Account Created:</span>
                  <span className="font-semibold text-foreground">{new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="mt-2">Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardContent className="p-4">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-sm font-bold text-foreground w-full"
            >
              <Lock className="w-4 h-4 text-red-400" />
              Change Password
            </button>
            {showPasswordSection && (
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase font-mono">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="font-mono" />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button onClick={handleChangePassword} loading={updating} loadingText="Changing..." disabled={!currentPassword || !newPassword || !confirmPassword}>
                  Update Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}